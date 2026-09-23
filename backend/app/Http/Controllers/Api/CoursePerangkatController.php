<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\ChecklistItem;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentFile;
use App\Models\DocumentFolder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CoursePerangkatController extends Controller
{
    /**
     * Get grid matrix of all courses and their 9 Perangkat Perkuliahan items.
     */
    public function index(Request $request): JsonResponse
    {
        $period = AcademicPeriod::where('is_active', true)->first() ?: AcademicPeriod::first();
        $department = Department::where('code', $request->query('department', 'TIND'))->first() ?: Department::first();

        $courses = Course::where('department_id', $department->id)
            ->where('academic_period_id', $period->id)
            ->orderBy('code')
            ->get();

        $perangkatItems = ChecklistItem::where('is_per_course', true)
            ->orderBy('sort_order')
            ->get();

        $documents = DocumentFile::with(['versions', 'latestVerification'])
            ->where('academic_period_id', $period->id)
            ->where('department_id', $department->id)
            ->whereNotNull('course_id')
            ->get();

        $matrix = $courses->map(function ($course) use ($perangkatItems, $documents) {
            $itemsStatus = $perangkatItems->map(function ($item) use ($course, $documents) {
                $doc = $documents->first(fn ($d) => $d->course_id == $course->id && $d->checklist_item_id == $item->id);

                // If non-practicum and item is 01h (Pedoman Praktikum)
                $defaultStatus = (!$course->has_practicum && $item->code === '01h') ? 'not_applicable' : 'missing';

                return [
                    'checklist_item_id' => $item->id,
                    'code' => $item->code,
                    'subfolder' => basename($item->subfolder),
                    'document_name' => $item->document_name,
                    'status' => $doc ? $doc->status : $defaultStatus,
                    'document' => $doc ? [
                        'id' => $doc->id,
                        'file_name' => $doc->file_name,
                        'original_name' => $doc->original_name,
                        'file_size' => $doc->file_size,
                        'current_version' => $doc->current_version,
                        'storage_path' => $doc->storage_path,
                        'drive_url' => $doc->drive_url,
                        'source_type' => $doc->source_type,
                        'drive_embed_url' => $doc->drive_embed_url,
                        'is_digitally_signed' => $doc->is_digitally_signed,
                        'verification' => $doc->latestVerification,
                    ] : null,
                ];
            });

            // Calculate course completion %
            $fulfilled = $itemsStatus->filter(fn ($it) => in_array($it['status'], ['verified', 'not_applicable', 'submitted']))->count();
            $percent = (int) round(($fulfilled / max(1, $itemsStatus->count())) * 100);

            return [
                'course' => $course,
                'completion_percent' => $percent,
                'items' => $itemsStatus,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'perangkat_columns' => $perangkatItems,
                'matrix' => $matrix,
            ],
        ]);
    }

    /**
     * Store a newly created course.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20',
            'name' => 'required|string|max:150',
            'credits' => 'required|integer|min:1|max:8',
            'semester' => 'required|integer|min:1|max:8',
            'lecturer_name' => 'required|string|max:150',
            'has_practicum' => 'nullable|boolean',
            'department_code' => 'nullable|string',
        ]);

        $period = AcademicPeriod::where('is_active', true)->first() ?: AcademicPeriod::first();
        $deptCode = $validated['department_code'] ?? 'TIND';
        $department = Department::where('code', $deptCode)->first() ?: Department::first();

        $code = strtoupper(trim($validated['code']));

        // Check uniqueness in department & period
        $exists = Course::where('department_id', $department->id)
            ->where('academic_period_id', $period->id)
            ->where('code', $code)
            ->exists();

        if ($exists) {
            return response()->json([
                'status' => 'error',
                'message' => "Kode mata kuliah '{$code}' sudah terdaftar pada program studi ini.",
            ], 422);
        }

        $course = Course::create([
            'department_id' => $department->id,
            'academic_period_id' => $period->id,
            'code' => $code,
            'name' => trim($validated['name']),
            'credits' => (int) $validated['credits'],
            'semester' => (int) $validated['semester'],
            'lecturer_name' => trim($validated['lecturer_name']),
            'has_practicum' => (bool) ($validated['has_practicum'] ?? false),
        ]);

        // Scaffold folder for this course
        $this->scaffoldCourseFolder($course, $department, $period);

        // Handle default 01h (Pedoman Praktikum) status
        $practicumItem = ChecklistItem::where('code', '01h')->first();
        if ($practicumItem) {
            DocumentFile::create([
                'checklist_item_id' => $practicumItem->id,
                'course_id' => $course->id,
                'department_id' => $course->department_id,
                'academic_period_id' => $course->academic_period_id,
                'title' => "Pedoman Praktikum - {$course->name}",
                'file_name' => '',
                'original_name' => '',
                'storage_path' => '',
                'status' => $course->has_practicum ? 'missing' : 'not_applicable',
                'notes' => $course->has_practicum ? null : 'Mata kuliah teori non-praktikum (Dikecualikan dari audit)',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Mata kuliah berhasil ditambahkan ke matriks perangkat perkuliahan.',
            'data' => $course,
        ], 201);
    }

    /**
     * Display the specified course with document status.
     */
    public function show(int $id): JsonResponse
    {
        $course = Course::with(['department', 'academicPeriod'])->findOrFail($id);

        $perangkatItems = ChecklistItem::where('is_per_course', true)
            ->orderBy('sort_order')
            ->get();

        $documents = DocumentFile::with(['versions', 'latestVerification'])
            ->where('course_id', $course->id)
            ->get();

        $itemsStatus = $perangkatItems->map(function ($item) use ($course, $documents) {
            $doc = $documents->first(fn ($d) => $d->checklist_item_id == $item->id);
            $defaultStatus = (!$course->has_practicum && $item->code === '01h') ? 'not_applicable' : 'missing';

            return [
                'checklist_item_id' => $item->id,
                'code' => $item->code,
                'subfolder' => basename($item->subfolder),
                'document_name' => $item->document_name,
                'iso_clause' => $item->iso_clause,
                'instructions' => $item->instructions,
                'status' => $doc ? $doc->status : $defaultStatus,
                'document' => $doc ? [
                    'id' => $doc->id,
                    'file_name' => $doc->file_name,
                    'original_name' => $doc->original_name,
                    'file_size' => $doc->file_size,
                    'current_version' => $doc->current_version,
                    'storage_path' => $doc->storage_path,
                    'drive_url' => $doc->drive_url,
                    'source_type' => $doc->source_type,
                    'drive_embed_url' => $doc->drive_embed_url,
                    'is_digitally_signed' => $doc->is_digitally_signed,
                    'verification' => $doc->latestVerification,
                ] : null,
            ];
        });

        $fulfilled = $itemsStatus->filter(fn ($it) => in_array($it['status'], ['verified', 'not_applicable', 'submitted']))->count();
        $completionPercent = (int) round(($fulfilled / max(1, $itemsStatus->count())) * 100);

        return response()->json([
            'status' => 'success',
            'data' => [
                'course' => $course,
                'completion_percent' => $completionPercent,
                'items' => $itemsStatus,
            ],
        ]);
    }

    /**
     * Update the specified course.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:20',
            'name' => 'required|string|max:150',
            'credits' => 'required|integer|min:1|max:8',
            'semester' => 'required|integer|min:1|max:8',
            'lecturer_name' => 'required|string|max:150',
            'has_practicum' => 'nullable|boolean',
        ]);

        $newCode = strtoupper(trim($validated['code']));

        // Check uniqueness excluding current course
        $exists = Course::where('department_id', $course->department_id)
            ->where('academic_period_id', $course->academic_period_id)
            ->where('code', $newCode)
            ->where('id', '!=', $course->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'status' => 'error',
                'message' => "Kode mata kuliah '{$newCode}' sudah digunakan oleh mata kuliah lain.",
            ], 422);
        }

        $oldPracticum = (bool) $course->has_practicum;
        $newPracticum = (bool) ($validated['has_practicum'] ?? false);

        $course->update([
            'code' => $newCode,
            'name' => trim($validated['name']),
            'credits' => (int) $validated['credits'],
            'semester' => (int) $validated['semester'],
            'lecturer_name' => trim($validated['lecturer_name']),
            'has_practicum' => $newPracticum,
        ]);

        // If practicum changed, update 01h item status
        if ($oldPracticum !== $newPracticum) {
            $practicumItem = ChecklistItem::where('code', '01h')->first();
            if ($practicumItem) {
                $doc = DocumentFile::where('checklist_item_id', $practicumItem->id)
                    ->where('course_id', $course->id)
                    ->first();

                if ($doc) {
                    if (!$newPracticum) {
                        $doc->update([
                            'status' => 'not_applicable',
                            'notes' => 'Mata kuliah teori non-praktikum (Dikecualikan dari audit)',
                        ]);
                    } else if ($doc->status === 'not_applicable') {
                        $doc->update([
                            'status' => 'missing',
                            'notes' => null,
                        ]);
                    }
                } else if (!$newPracticum) {
                    DocumentFile::create([
                        'checklist_item_id' => $practicumItem->id,
                        'course_id' => $course->id,
                        'department_id' => $course->department_id,
                        'academic_period_id' => $course->academic_period_id,
                        'title' => "Pedoman Praktikum - {$course->name}",
                        'file_name' => '',
                        'original_name' => '',
                        'storage_path' => '',
                        'status' => 'not_applicable',
                        'notes' => 'Mata kuliah teori non-praktikum (Dikecualikan dari audit)',
                    ]);
                }
            }
        }

        // Update folder name in DocumentFolder if exists
        $courseFolder = DocumentFolder::where('course_id', $course->id)
            ->whereNotNull('parent_id')
            ->whereNull('checklist_item_id')
            ->first();

        if ($courseFolder) {
            $courseFolder->update([
                'name' => "{$course->code} - {$course->name}",
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data mata kuliah berhasil diperbarui.',
            'data' => $course,
        ]);
    }

    /**
     * Remove the specified course and associated files.
     */
    public function destroy(int $id): JsonResponse
    {
        $course = Course::findOrFail($id);

        // Delete physical files and records
        $documents = DocumentFile::where('course_id', $course->id)->get();
        foreach ($documents as $doc) {
            if ($doc->storage_path && Storage::disk('public')->exists($doc->storage_path)) {
                Storage::disk('public')->delete($doc->storage_path);
            }
            $doc->delete();
        }

        // Delete folder records
        DocumentFolder::where('course_id', $course->id)->delete();

        $courseName = $course->name;
        $courseCode = $course->code;
        $course->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Mata kuliah {$courseCode} ({$courseName}) berhasil dihapus.",
        ]);
    }

    /**
     * Toggle practicum requirement for a course.
     */
    public function togglePracticum(Request $request, int $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);
        $course->has_practicum = !$course->has_practicum;
        $course->save();

        $practicumItem = ChecklistItem::where('code', '01h')->first();
        if ($practicumItem) {
            $doc = DocumentFile::firstOrCreate(
                [
                    'checklist_item_id' => $practicumItem->id,
                    'course_id' => $course->id,
                    'department_id' => $course->department_id,
                    'academic_period_id' => $course->academic_period_id,
                ],
                [
                    'title' => "Pedoman Praktikum - {$course->name}",
                    'file_name' => '',
                    'original_name' => '',
                    'storage_path' => '',
                    'status' => $course->has_practicum ? 'missing' : 'not_applicable',
                    'notes' => $course->has_practicum ? null : 'Mata kuliah teori non-praktikum',
                ]
            );

            if (!$course->has_practicum) {
                $doc->update([
                    'status' => 'not_applicable',
                    'notes' => 'Mata kuliah teori non-praktikum (Dikecualikan dari audit)',
                ]);
            } else if ($doc->status === 'not_applicable') {
                $doc->update([
                    'status' => 'missing',
                    'notes' => null,
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $course,
        ]);
    }

    /**
     * Helper to scaffold course folder and 9 subfolders.
     */
    private function scaffoldCourseFolder(Course $course, Department $department, AcademicPeriod $period): void
    {
        $baseRelativePath = "documents/{$period->code}/{$department->code}/01_Kurikulum/Perangkat-Perkuliahan";
        Storage::disk('public')->makeDirectory($baseRelativePath);

        // Find or create Perangkat-Perkuliahan folder
        $parentKurikulum = DocumentFolder::firstOrCreate(
            [
                'academic_period_id' => $period->id,
                'department_id' => $department->id,
                'name' => '01_Kurikulum',
                'parent_id' => null,
            ],
            [
                'slug' => '01_kurikulum',
                'path' => "documents/{$period->code}/{$department->code}/01_Kurikulum",
                'is_system' => true,
            ]
        );

        $perangkatParent = DocumentFolder::firstOrCreate(
            [
                'academic_period_id' => $period->id,
                'department_id' => $department->id,
                'parent_id' => $parentKurikulum->id,
                'name' => 'Perangkat-Perkuliahan',
            ],
            [
                'slug' => 'perangkat-perkuliahan',
                'path' => $baseRelativePath,
                'is_system' => true,
            ]
        );

        $courseFolderName = "{$course->code}_" . Str::limit(Str::slug($course->name), 40, '');
        $coursePath = "{$baseRelativePath}/{$courseFolderName}";
        Storage::disk('public')->makeDirectory($coursePath);

        $courseFolder = DocumentFolder::firstOrCreate(
            [
                'academic_period_id' => $period->id,
                'department_id' => $department->id,
                'parent_id' => $perangkatParent->id,
                'course_id' => $course->id,
                'name' => "{$course->code} - {$course->name}",
            ],
            [
                'slug' => Str::slug("{$course->code}_{$course->name}"),
                'path' => $coursePath,
                'is_system' => true,
            ]
        );

        $perangkatSubfolders = [
            'a_Silabus',
            'b_RencanaPembelajaran',
            'c_Daftar-HadirPerkuliahan',
            'd_JurnalPembelajaran',
            'e_Kontrak-Belajar',
            'f_MateriPembelajaran',
            'g_Soal-UTS-UASdan-Verifikasi',
            'h_PedomanPraktikum',
            'i_Bukti-Penilaian',
        ];

        foreach ($perangkatSubfolders as $sub) {
            $subPath = "{$coursePath}/{$sub}";
            Storage::disk('public')->makeDirectory($subPath);

            DocumentFolder::firstOrCreate(
                [
                    'academic_period_id' => $period->id,
                    'department_id' => $department->id,
                    'parent_id' => $courseFolder->id,
                    'course_id' => $course->id,
                    'name' => $sub,
                ],
                [
                    'slug' => Str::slug($sub),
                    'path' => $subPath,
                    'is_system' => true,
                ]
            );
        }
    }
}

