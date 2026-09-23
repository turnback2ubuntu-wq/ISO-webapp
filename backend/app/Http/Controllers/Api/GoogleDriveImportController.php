<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\ChecklistItem;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentFile;
use App\Models\DocumentFolder;
use App\Models\DocumentVersion;
use App\Services\GoogleDriveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GoogleDriveImportController extends Controller
{
    public function __construct(
        protected GoogleDriveService $driveService
    ) {}

    /**
     * Upload or register a single document via Google Drive link.
     */
    public function uploadDriveLink(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'checklist_item_id' => 'required|exists:checklist_items,id',
            'course_id' => 'nullable|exists:courses,id',
            'department_id' => 'nullable|exists:departments,id',
            'department_code' => 'nullable|string',
            'drive_url' => 'required|url',
            'title' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'is_digitally_signed' => 'nullable|boolean',
            'uploaded_by' => 'nullable|string|max:150',
            'should_download' => 'nullable|boolean',
            'sync_to_git' => 'nullable|boolean',
        ]);

        $driveInfo = $this->driveService->parseDriveUrl($validated['drive_url']);
        if (!$driveInfo['is_valid']) {
            return response()->json([
                'status' => 'error',
                'message' => 'Format tautan Google Drive tidak valid. Mohon sertakan link berkas atau folder Google Drive yang benar.',
            ], 422);
        }

        $period = AcademicPeriod::where('is_active', true)->first() ?: AcademicPeriod::first();
        
        $course = !empty($validated['course_id']) ? Course::with('department')->find($validated['course_id']) : null;
        if ($course && $course->department) {
            $department = $course->department;
        } else if (!empty($validated['department_id'])) {
            $department = Department::find($validated['department_id']) ?: Department::first();
        } else if (!empty($validated['department_code'])) {
            $department = Department::where('code', $validated['department_code'])->first() ?: Department::first();
        } else {
            $department = Department::where('code', 'TIF')->first() ?: Department::first();
        }

        $checklistItem = ChecklistItem::findOrFail($validated['checklist_item_id']);

        $title = !empty($validated['title']) ? $validated['title'] : ($course ? "{$course->code} - {$checklistItem->document_name}" : $checklistItem->document_name);
        $uploadedBy = $validated['uploaded_by'] ?? 'Dosen Pengampu';
        $notes = $validated['notes'] ?? 'Dokumen diunggah melalui tautan Google Drive';

        // Check if user requested physical file download
        $shouldDownload = (bool) ($validated['should_download'] ?? false);
        $downloadResult = null;
        $sourceType = 'google_drive_link';

        if ($shouldDownload && in_array($driveInfo['type'], ['file', 'document', 'spreadsheet'])) {
            try {
                $subfolderName = basename($checklistItem->subfolder);
                if ($course) {
                    $courseFolder = "{$course->code}_" . Str::limit(Str::slug($course->name), 40, '');
                    $destDir = "documents/{$period->code}/{$department->code}/01_Kurikulum/Perangkat-Perkuliahan/{$courseFolder}/{$subfolderName}";
                } else {
                    $destDir = "documents/{$period->code}/{$department->code}/" . Str::slug($checklistItem->root_folder);
                }

                $downloadResult = $this->driveService->downloadFile(
                    $validated['drive_url'],
                    $destDir,
                    Str::slug($title) . '.pdf'
                );
                $sourceType = 'google_drive_synced';
            } catch (\Throwable $e) {
                Log::warning("Gagal mengunduh berkas Google Drive: " . $e->getMessage());
                // Fallback to link-only
            }
        }

        // Find target folder
        $targetFolder = null;
        if ($course) {
            $subfolderName = basename($checklistItem->subfolder);
            $targetFolder = DocumentFolder::where('course_id', $course->id)
                ->where('name', $subfolderName)
                ->first();
        } else {
            $targetFolder = DocumentFolder::where('name', $checklistItem->root_folder)->whereNull('parent_id')->first();
        }

        // Query or create document record
        $query = DocumentFile::where('checklist_item_id', $checklistItem->id)
            ->where('academic_period_id', $period->id)
            ->where('department_id', $department->id);

        if ($course) {
            $query->where('course_id', $course->id);
        } else {
            $query->whereNull('course_id');
        }

        $document = $query->first();

        $docPayload = [
            'checklist_item_id' => $checklistItem->id,
            'course_id' => $course?->id,
            'department_id' => $department->id,
            'academic_period_id' => $period->id,
            'folder_id' => $targetFolder?->id,
            'title' => $title,
            'drive_url' => $validated['drive_url'],
            'source_type' => $sourceType,
            'is_external_link' => true,
            'status' => 'submitted',
            'is_digitally_signed' => (bool) ($validated['is_digitally_signed'] ?? true),
            'uploaded_by' => $uploadedBy,
            'notes' => $notes,
        ];

        if ($downloadResult) {
            $docPayload['file_name'] = $downloadResult['file_name'];
            $docPayload['original_name'] = $downloadResult['original_name'];
            $docPayload['storage_path'] = $downloadResult['storage_path'];
            $docPayload['file_size'] = $downloadResult['file_size'];
            $docPayload['mime_type'] = $downloadResult['mime_type'];
            $docPayload['file_hash'] = $downloadResult['file_hash'];
        } else {
            $docPayload['file_name'] = 'Google_Drive_Link.url';
            $docPayload['original_name'] = 'Tautan Dokumen Google Drive';
            $docPayload['mime_type'] = 'text/uri-list';
        }

        if (!$document) {
            $docPayload['current_version'] = 'v1.0';
            $document = DocumentFile::create($docPayload);

            DocumentVersion::create([
                'document_file_id' => $document->id,
                'version_number' => 'v1.0',
                'storage_path' => $document->storage_path ?: $validated['drive_url'],
                'original_name' => $document->original_name,
                'file_size' => $document->file_size ?: 0,
                'changelog' => 'Penyampaian dokumen melalui link Google Drive',
                'uploaded_by' => $uploadedBy,
            ]);
        } else {
            $document->update($docPayload);
        }

        // Git Sync if requested
        if (!empty($validated['sync_to_git'])) {
            $this->driveService->syncToGitRepo($document, $department->code);
        }

        $document->load(['checklistItem', 'course', 'versions']);

        return response()->json([
            'status' => 'success',
            'message' => 'Dokumen berhasil ditautkan dari Google Drive ke sistem ISO 21001.',
            'data' => $document,
        ]);
    }

    /**
     * Parse raw CSV or Google Sheet URL to return preview mapping table.
     */
    public function parseSpreadsheet(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'csv_content' => 'nullable|string',
            'sheet_url' => 'nullable|url',
            'department_code' => 'nullable|string',
        ]);

        $deptCode = $validated['department_code'] ?? 'TIF';
        $department = Department::where('code', $deptCode)->first() ?: Department::first();

        $content = $validated['csv_content'] ?? '';

        if (!empty($validated['sheet_url'])) {
            $parsed = $this->driveService->parseDriveUrl($validated['sheet_url']);
            if ($parsed['is_valid'] && !empty($parsed['csv_url'])) {
                try {
                    $res = Http::withOptions(['verify' => false, 'timeout' => 30])->get($parsed['csv_url']);
                    if ($res->successful()) {
                        $content = $res->body();
                    }
                } catch (\Throwable $e) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Gagal membaca Google Sheets langsung. Pastikan dokumen dibuka dengan izin "Siapa saja yang memiliki link". Atau salin isi tabel langsung ke form.',
                    ], 422);
                }
            }
        }

        if (empty(trim($content))) {
            return response()->json([
                'status' => 'error',
                'message' => 'Konten spreadsheet atau teks CSV kosong.',
            ], 422);
        }

        $mappedRows = $this->driveService->parseSpreadsheetData($content, $department->id);

        $validCount = count(array_filter($mappedRows, fn($r) => $r['can_import']));

        return response()->json([
            'status' => 'success',
            'total_rows' => count($mappedRows),
            'valid_rows_count' => $validCount,
            'department' => $department->name,
            'data' => $mappedRows,
        ]);
    }

    /**
     * Execute bulk import from verified mapped rows.
     */
    public function bulkImport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rows' => 'required|array|min:1',
            'department_code' => 'nullable|string',
            'should_download' => 'nullable|boolean',
            'sync_to_git' => 'nullable|boolean',
        ]);

        $deptCode = $validated['department_code'] ?? 'TIF';
        $department = Department::where('code', $deptCode)->first() ?: Department::first();
        $period = AcademicPeriod::where('is_active', true)->first() ?: AcademicPeriod::first();

        $shouldDownload = (bool) ($validated['should_download'] ?? false);
        $syncToGit = (bool) ($validated['sync_to_git'] ?? false);

        $imported = 0;
        $failed = 0;
        $errors = [];

        foreach ($validated['rows'] as $idx => $row) {
            $linkInput = $row['link_input'] ?? $row['drive_url'] ?? $row['url'] ?? $row['link'] ?? null;
            
            // Resolve Checklist Item
            $itemId = $row['matched_item_id'] ?? $row['checklist_item_id'] ?? null;
            $itemCode = $row['category_code'] ?? $row['code'] ?? null;

            $checklistItem = null;
            if ($itemId) {
                $checklistItem = ChecklistItem::find($itemId);
            } elseif ($itemCode) {
                $checklistItem = ChecklistItem::where('code', $itemCode)->first();
            }

            if (!$checklistItem || empty($linkInput)) {
                $failed++;
                continue;
            }

            // Resolve Course if specified
            $courseId = $row['matched_course_id'] ?? $row['course_id'] ?? null;
            $courseCode = $row['course_code'] ?? null;

            $course = null;
            if ($courseId) {
                $course = Course::find($courseId);
            } elseif ($courseCode) {
                $course = Course::where('department_id', $department->id)
                    ->where('academic_period_id', $period->id)
                    ->where('code', $courseCode)
                    ->first();
            }

            $title = $course ? "{$course->code} - {$checklistItem->document_name}" : $checklistItem->document_name;
            $lecturer = $row['lecturer'] ?? $row['lecturer_name'] ?? ($course?->lecturer_name ?? 'Dosen Pengampu');
            $rowLink = $linkInput;

            try {
                $downloadResult = null;
                $sourceType = 'google_drive_link';

                if ($shouldDownload) {
                    try {
                        $destDir = "documents/{$period->code}/{$department->code}/" . Str::slug($checklistItem->root_folder);
                        if ($course) {
                            $destDir .= '/' . Str::slug($course->code);
                        }

                        $downloadResult = $this->driveService->downloadFile(
                            $rowLink,
                            $destDir,
                            Str::slug($title) . '.pdf'
                        );
                        $sourceType = 'google_drive_synced';
                    } catch (\Throwable $dlErr) {
                        Log::warning("Bulk download skip for row {$idx}: " . $dlErr->getMessage());
                    }
                }

                $query = DocumentFile::where('checklist_item_id', $checklistItem->id)
                    ->where('academic_period_id', $period->id)
                    ->where('department_id', $department->id);

                if ($course) {
                    $query->where('course_id', $course->id);
                } else {
                    $query->whereNull('course_id');
                }

                $document = $query->first();

                $notes = !empty($row['notes']) ? $row['notes'] : 'Diimpor otomatis dari rekap Google Sheets';

                $docPayload = [
                    'checklist_item_id' => $checklistItem->id,
                    'course_id' => $course?->id,
                    'department_id' => $department->id,
                    'academic_period_id' => $period->id,
                    'title' => $title,
                    'drive_url' => $rowLink,
                    'source_type' => $sourceType,
                    'is_external_link' => true,
                    'status' => 'submitted',
                    'is_digitally_signed' => true,
                    'uploaded_by' => $lecturer,
                    'notes' => $notes,
                ];

                if ($downloadResult) {
                    $docPayload['file_name'] = $downloadResult['file_name'];
                    $docPayload['original_name'] = $downloadResult['original_name'];
                    $docPayload['storage_path'] = $downloadResult['storage_path'];
                    $docPayload['file_size'] = $downloadResult['file_size'];
                    $docPayload['mime_type'] = $downloadResult['mime_type'];
                    $docPayload['file_hash'] = $downloadResult['file_hash'];
                } else {
                    $docPayload['file_name'] = 'Google_Drive_Link.url';
                    $docPayload['original_name'] = 'Tautan Dokumen Google Drive';
                    $docPayload['mime_type'] = 'text/uri-list';
                }

                if (!$document) {
                    $docPayload['current_version'] = 'v1.0';
                    $document = DocumentFile::create($docPayload);
                } else {
                    $document->update($docPayload);
                }

                if ($syncToGit) {
                    $this->driveService->syncToGitRepo($document, $department->code);
                }

                $imported++;
            } catch (\Throwable $e) {
                $failed++;
                $errors[] = "Baris #{$idx}: " . $e->getMessage();
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Berhasil memproses {$imported} dokumen dari link Google Drive.",
            'imported' => $imported,
            'failed' => $failed,
            'errors' => $errors,
        ]);
    }

    /**
     * Trigger git push from backend container to remote origin.
     */
    public function syncGitRepo(Request $request): JsonResponse
    {
        $deptCode = $request->input('department_code', 'TIF');
        $gitBaseDir = '/var/www/github-repo';
        if (!is_dir($gitBaseDir)) {
            $gitBaseDir = base_path('../Github');
        }
        if (!is_dir($gitBaseDir)) {
            $gitBaseDir = '/home/andy/VibeCoding/ISO21001-webapp/Github';
        }

        if (!is_dir($gitBaseDir)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Direktori Git tidak ditemukan.',
            ], 404);
        }

        // Sync all submitted/verified documents with drive_url
        $documents = DocumentFile::with(['checklistItem', 'course'])
            ->whereNotNull('drive_url')
            ->get();

        $syncedCount = 0;
        foreach ($documents as $doc) {
            if ($this->driveService->syncToGitRepo($doc, $deptCode)) {
                $syncedCount++;
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Berhasil menyinkronkan {$syncedCount} dokumen ke repositori Git lokal.",
            'synced_count' => $syncedCount,
        ]);
    }
}
