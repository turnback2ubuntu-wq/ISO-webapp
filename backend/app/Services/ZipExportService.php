<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentFile;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class ZipExportService
{
    /**
     * Build and return path to a ZIP archive containing requested files.
     */
    public function exportZip(
        AcademicPeriod $period,
        Department $department,
        ?string $rootFolder = null,
        ?int $courseId = null
    ): ?string {
        if (!class_exists('ZipArchive')) {
            throw new \RuntimeException('PHP ZipArchive extension is required for ZIP export.');
        }

        $query = DocumentFile::with(['checklistItem', 'course'])
            ->where('academic_period_id', $period->id)
            ->where('department_id', $department->id)
            ->whereNotNull('storage_path');

        if ($rootFolder) {
            $query->whereHas('checklistItem', function ($q) use ($rootFolder) {
                $q->where('root_folder', $rootFolder);
            });
        }

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        $documents = $query->get();

        $tempDir = storage_path('app/temp_exports');
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $zipFileName = 'ISO21001_' . $department->code . '_' . $period->code;
        if ($rootFolder) {
            $zipFileName .= "_{$rootFolder}";
        }
        if ($courseId) {
            $course = Course::find($courseId);
            if ($course) {
                $zipFileName .= "_{$course->code}";
            }
        }
        $zipFileName .= '_' . date('Ymd_His') . '.zip';
        $zipFilePath = "{$tempDir}/{$zipFileName}";

        $zip = new ZipArchive();
        if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return null;
        }

        $addedCount = 0;
        foreach ($documents as $doc) {
            if (empty($doc->storage_path)) {
                continue;
            }
            $fullDiskPath = Storage::disk('public')->path($doc->storage_path);
            if (!file_exists($fullDiskPath) || is_dir($fullDiskPath)) {
                continue;
            }

            // Construct relative path inside ZIP
            $item = $doc->checklistItem;
            $root = $item->root_folder;
            $sub = $item->subfolder == '(root folder)' ? '' : $item->subfolder;

            if ($item->is_per_course && $doc->course) {
                $courseName = "{$doc->course->code}_{$doc->course->name}";
                $inZipPath = "{$root}/Perangkat-Perkuliahan/{$courseName}/" . basename($sub) . "/{$doc->original_name}";
            } else {
                $inZipPath = "{$root}/" . ($sub ? "{$sub}/" : '') . $doc->original_name;
            }

            $zip->addFile($fullDiskPath, $inZipPath);
            $addedCount++;
        }

        // Add a manifest text file
        $manifestContent = "BUNDEL DOKUMEN MUTU ISO 21001:2018 (EOMS)\n";
        $manifestContent .= "Program Studi : {$department->name} ({$department->code})\n";
        $manifestContent .= "Fakultas      : {$department->faculty}\n";
        $manifestContent .= "Periode       : {$period->name}\n";
        $manifestContent .= "Waktu Ekspor  : " . date('Y-m-d H:i:s') . "\n";
        $manifestContent .= "Jumlah Berkas : {$addedCount} berkas\n\n";
        $manifestContent .= "Daftar Berkas Terkumpul:\n";
        foreach ($documents as $idx => $d) {
            $manifestContent .= ($idx + 1) . ". [{$d->checklistItem->code}] {$d->title} ({$d->current_version}) - Status: {$d->status}\n";
        }
        $zip->addFromString('METADATA_MANIFEST_AUDIT.txt', $manifestContent);

        $zip->close();

        return $zipFilePath;
    }
}
