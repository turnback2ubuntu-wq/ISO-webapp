<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use App\Models\ChecklistItem;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentFile;
use App\Models\DocumentFolder;
use App\Models\DocumentVersion;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileStorageService
{
    /**
     * Store or update a document file with version control.
     */
    public function storeFile(
        UploadedFile $file,
        ChecklistItem $checklistItem,
        int $academicPeriodId,
        int $departmentId,
        ?int $courseId = null,
        ?string $title = null,
        ?string $notes = null,
        bool $isDigitallySigned = false,
        string $uploadedBy = 'PIC Mutu',
        string $versionType = 'initial' // initial, minor, major
    ): DocumentFile {
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getClientMimeType();
        $fileSize = $file->getSize();
        $hash = hash_file('sha256', $file->getRealPath());

        $period = AcademicPeriod::find($academicPeriodId) ?: (AcademicPeriod::where('is_active', true)->first() ?: AcademicPeriod::first());
        $department = Department::find($departmentId) ?: (Department::where('code', 'TIF')->first() ?: Department::first());
        $periodCode = $period ? $period->code : '20252';
        $deptCode = $department ? $department->code : 'TIF';

        // Construct destination folder path
        $rootFolder = $checklistItem->root_folder;
        $subfolder = $checklistItem->subfolder == '(root folder)' ? '' : $checklistItem->subfolder;
        $subfolderName = basename($subfolder);

        $targetFolder = null;
        if ($checklistItem->is_per_course && $courseId) {
            $course = Course::find($courseId);
            $courseFolder = $course ? "{$course->code}_" . Str::limit(Str::slug($course->name), 40, '') : "course_{$courseId}";
            $destinationDir = "documents/{$periodCode}/{$deptCode}/01_Kurikulum/Perangkat-Perkuliahan/{$courseFolder}/{$subfolderName}";

            $targetFolder = DocumentFolder::where('course_id', $courseId)
                ->where('name', $subfolderName)
                ->first();
        } else {
            $destinationDir = "documents/{$periodCode}/{$deptCode}/{$rootFolder}" . ($subfolder ? "/{$subfolder}" : '');
            $targetFolder = DocumentFolder::where('name', $rootFolder)->whereNull('parent_id')->first();
        }

        Storage::disk('public')->makeDirectory($destinationDir);

        $sanitizedBase = Str::slug(pathinfo($originalName, PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();
        $savedFileName = time() . "_{$sanitizedBase}.{$extension}";
        $storagePath = $file->storeAs($destinationDir, $savedFileName, 'public');

        // Look for existing document record
        $query = DocumentFile::where('checklist_item_id', $checklistItem->id)
            ->where('academic_period_id', $academicPeriodId)
            ->where('department_id', $departmentId);

        if ($courseId) {
            $query->where('course_id', $courseId);
        } else {
            $query->whereNull('course_id');
        }

        $document = $query->first();

        if (!$document) {
            // First time upload
            $document = DocumentFile::create([
                'checklist_item_id' => $checklistItem->id,
                'course_id' => $courseId,
                'department_id' => $departmentId,
                'academic_period_id' => $academicPeriodId,
                'folder_id' => $targetFolder?->id,
                'title' => $title ?: $checklistItem->document_name,
                'file_name' => $savedFileName,
                'original_name' => $originalName,
                'storage_path' => $storagePath,
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'file_hash' => $hash,
                'current_version' => 'v1.0',
                'status' => 'submitted',
                'is_digitally_signed' => $isDigitallySigned,
                'uploaded_by' => $uploadedBy,
                'notes' => $notes,
            ]);

            DocumentVersion::create([
                'document_file_id' => $document->id,
                'version_number' => 'v1.0',
                'storage_path' => $storagePath,
                'original_name' => $originalName,
                'file_size' => $fileSize,
                'file_hash' => $hash,
                'changelog' => 'Unggahan berkas pertama kali',
                'uploaded_by' => $uploadedBy,
            ]);
        } else {
            // New version bump
            $currentVer = $document->current_version ?: 'v1.0';
            $nextVer = $this->bumpVersion($currentVer, $versionType);

            $document->update([
                'folder_id' => $targetFolder?->id ?: $document->folder_id,
                'title' => $title ?: $document->title,
                'file_name' => $savedFileName,
                'original_name' => $originalName,
                'storage_path' => $storagePath,
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'file_hash' => $hash,
                'current_version' => $nextVer,
                'status' => 'submitted',
                'is_digitally_signed' => $isDigitallySigned,
                'uploaded_by' => $uploadedBy,
                'notes' => $notes ?: $document->notes,
            ]);

            DocumentVersion::create([
                'document_file_id' => $document->id,
                'version_number' => $nextVer,
                'storage_path' => $storagePath,
                'original_name' => $originalName,
                'file_size' => $fileSize,
                'file_hash' => $hash,
                'changelog' => $notes ?: "Pembaruan dokumen ke versi {$nextVer}",
                'uploaded_by' => $uploadedBy,
            ]);
        }

        return $document;
    }

    private function bumpVersion(string $current, string $type): string
    {
        preg_match('/v?(\d+)\.(\d+)/', $current, $matches);
        $major = isset($matches[1]) ? (int) $matches[1] : 1;
        $minor = isset($matches[2]) ? (int) $matches[2] : 0;

        if ($type === 'major') {
            $major++;
            $minor = 0;
        } else {
            $minor++;
        }

        return "v{$major}.{$minor}";
    }
}
