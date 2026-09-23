<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\ChecklistItem;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentFile;
use App\Services\FileStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentFileController extends Controller
{
    /**
     * Upload a new document file or version.
     */
    public function upload(Request $request, FileStorageService $storageService): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|max:51200', // up to 50MB
            'checklist_item_id' => 'required|exists:checklist_items,id',
            'course_id' => 'nullable|exists:courses,id',
            'department_id' => 'nullable|exists:departments,id',
            'department_code' => 'nullable|string',
            'title' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'is_digitally_signed' => 'nullable|boolean',
            'uploaded_by' => 'nullable|string|max:150',
            'version_type' => 'nullable|in:initial,minor,major',
        ]);

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

        $document = $storageService->storeFile(
            file: $request->file('file'),
            checklistItem: $checklistItem,
            academicPeriodId: $period->id,
            departmentId: $department->id,
            courseId: $validated['course_id'] ?? null,
            title: $validated['title'] ?? null,
            notes: $validated['notes'] ?? null,
            isDigitallySigned: (bool) ($validated['is_digitally_signed'] ?? false),
            uploadedBy: $validated['uploaded_by'] ?? 'PIC Mutu',
            versionType: $validated['version_type'] ?? 'minor'
        );

        $document->load(['checklistItem', 'course', 'versions', 'latestVerification']);

        return response()->json([
            'status' => 'success',
            'message' => 'Dokumen berhasil diunggah dan diverifikasi ke dalam repositori EOMS.',
            'data' => $document,
        ]);
    }

    /**
     * Show document details, versions, and audit history.
     */
    public function show(int $id): JsonResponse
    {
        $document = DocumentFile::with([
            'checklistItem',
            'course',
            'versions' => fn ($q) => $q->latest(),
            'verifications' => fn ($q) => $q->latest(),
            'comments' => fn ($q) => $q->oldest(),
        ])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $document,
        ]);
    }

    /**
     * Download or stream the physical document file.
     */
    public function download(int $id): BinaryFileResponse|JsonResponse
    {
        $document = DocumentFile::findOrFail($id);

        if (!$document->storage_path || !Storage::disk('public')->exists($document->storage_path)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Berkas fisik tidak ditemukan di sistem penyimpanan.',
            ], 404);
        }

        $fullPath = Storage::disk('public')->path($document->storage_path);
        return response()->download($fullPath, $document->original_name ?: $document->file_name);
    }

    /**
     * Delete document and physical file.
     */
    public function destroy(int $id): JsonResponse
    {
        $document = DocumentFile::findOrFail($id);

        if ($document->storage_path && Storage::disk('public')->exists($document->storage_path)) {
            Storage::disk('public')->delete($document->storage_path);
        }

        $document->update([
            'status' => 'missing',
            'file_name' => '',
            'original_name' => '',
            'storage_path' => '',
            'file_size' => 0,
            'file_hash' => null,
            'current_version' => 'v1.0',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Dokumen berhasil dihapus dari repositori.',
        ]);
    }
}
