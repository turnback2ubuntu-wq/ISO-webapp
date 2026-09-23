<?php

namespace App\Services;

use App\Models\ChecklistItem;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GoogleDriveService
{
    /**
     * Parse Google Drive URL and extract resource ID and direct preview/download links.
     */
    public function parseDriveUrl(string $url): array
    {
        $url = trim($url);

        // Pattern 1: Google Drive File /file/d/{id}
        if (preg_match('/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/', $url, $m)) {
            $id = $m[1];
            return [
                'is_valid' => true,
                'type' => 'file',
                'id' => $id,
                'preview_url' => "https://drive.google.com/file/d/{$id}/preview",
                'download_url' => "https://drive.google.com/uc?export=download&id={$id}",
                'canonical_url' => "https://drive.google.com/file/d/{$id}/view",
            ];
        }

        // Pattern 2: Google Drive open?id={id} or uc?id={id}
        if (preg_match('/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]+)/', $url, $m)) {
            $id = $m[1];
            return [
                'is_valid' => true,
                'type' => 'file',
                'id' => $id,
                'preview_url' => "https://drive.google.com/file/d/{$id}/preview",
                'download_url' => "https://drive.google.com/uc?export=download&id={$id}",
                'canonical_url' => "https://drive.google.com/file/d/{$id}/view",
            ];
        }

        // Pattern 3: Google Drive Folders /drive/folders/{id}
        if (preg_match('/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/', $url, $m)) {
            $id = $m[1];
            return [
                'is_valid' => true,
                'type' => 'folder',
                'id' => $id,
                'preview_url' => "https://drive.google.com/embeddedfolderview?id={$id}#list",
                'download_url' => null,
                'canonical_url' => "https://drive.google.com/drive/folders/{$id}",
            ];
        }

        // Pattern 4: Google Docs /document/d/{id}
        if (preg_match('/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/', $url, $m)) {
            $id = $m[1];
            return [
                'is_valid' => true,
                'type' => 'document',
                'id' => $id,
                'preview_url' => "https://docs.google.com/document/d/{$id}/preview",
                'download_url' => "https://docs.google.com/document/d/{$id}/export?format=pdf",
                'canonical_url' => "https://docs.google.com/document/d/{$id}/edit",
            ];
        }

        // Pattern 5: Google Sheets /spreadsheets/d/{id}
        if (preg_match('/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/', $url, $m)) {
            $id = $m[1];
            return [
                'is_valid' => true,
                'type' => 'spreadsheet',
                'id' => $id,
                'preview_url' => "https://docs.google.com/spreadsheets/d/{$id}/preview",
                'download_url' => "https://docs.google.com/spreadsheets/d/{$id}/export?format=xlsx",
                'csv_url' => "https://docs.google.com/spreadsheets/d/{$id}/export?format=csv",
                'canonical_url' => "https://docs.google.com/spreadsheets/d/{$id}/edit",
            ];
        }

        // Generic fallback for any other valid URL
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return [
                'is_valid' => true,
                'type' => 'external_link',
                'id' => null,
                'preview_url' => $url,
                'download_url' => null,
                'canonical_url' => $url,
            ];
        }

        return [
            'is_valid' => false,
            'type' => 'invalid',
            'id' => null,
            'preview_url' => null,
            'download_url' => null,
            'canonical_url' => null,
        ];
    }

    /**
     * Download public or shared file from Google Drive directly into server storage.
     */
    public function downloadFile(string $driveUrl, string $destinationDir, ?string $fallbackName = 'dokumen_drive.pdf'): array
    {
        $parsed = $this->parseDriveUrl($driveUrl);
        if (!$parsed['is_valid'] || empty($parsed['download_url'])) {
            throw new \Exception('Link Google Drive tidak valid atau tidak mendukung pengunduhan otomatis.');
        }

        $downloadUrl = $parsed['download_url'];

        // Make HTTP request with redirect following
        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ])->withOptions([
            'allow_redirects' => [
                'max' => 10,
                'strict' => true,
                'referer' => true,
                'protocols' => ['http', 'https'],
            ],
            'timeout' => 90,
            'verify' => false,
        ])->get($downloadUrl);

        if (!$response->successful()) {
            throw new \Exception("Gagal mengunduh berkas dari Google Drive (HTTP {$response->status()}). Pastikan izin berbagi diset ke 'Siapa saja yang memiliki link'.");
        }

        $body = $response->body();
        if (strlen($body) < 100 && str_contains($body, 'Google Drive - Virus scan warning')) {
            // Handle Google Drive big file virus warning confirm
            if (preg_match('/confirm=([a-zA-Z0-9_-]+)/', $body, $cm)) {
                $confirmUrl = $downloadUrl . '&confirm=' . $cm[1];
                $response = Http::withOptions(['verify' => false, 'timeout' => 90])->get($confirmUrl);
                $body = $response->body();
            }
        }

        // Determine file name and extension
        $fileName = $fallbackName;
        $contentDisposition = $response->header('Content-Disposition');
        if ($contentDisposition && preg_match('/filename=["\']?([^"\';]+)["\']?/', $contentDisposition, $matches)) {
            $fileName = trim($matches[1]);
        } else {
            $contentType = $response->header('Content-Type');
            $ext = 'pdf';
            if (str_contains($contentType, 'spreadsheet') || str_contains($contentType, 'excel')) {
                $ext = 'xlsx';
            } elseif (str_contains($contentType, 'word') || str_contains($contentType, 'officedocument')) {
                $ext = 'docx';
            } elseif (str_contains($contentType, 'image/jpeg')) {
                $ext = 'jpg';
            } elseif (str_contains($contentType, 'image/png')) {
                $ext = 'png';
            }

            if (!str_contains($fileName, '.')) {
                $fileName .= '.' . $ext;
            }
        }

        $sanitizedName = time() . '_' . Str::slug(pathinfo($fileName, PATHINFO_FILENAME)) . '.' . pathinfo($fileName, PATHINFO_EXTENSION);
        $storagePath = "{$destinationDir}/{$sanitizedName}";

        Storage::disk('public')->put($storagePath, $body);

        return [
            'file_name' => $sanitizedName,
            'original_name' => $fileName,
            'storage_path' => $storagePath,
            'file_size' => strlen($body),
            'mime_type' => $response->header('Content-Type') ?: 'application/octet-stream',
            'file_hash' => hash('sha256', $body),
        ];
    }

    /**
     * Parse raw CSV or Google Sheet lines into mapped rows for ISO 21001.
     */
    public function parseSpreadsheetData(string $content, int $departmentId): array
    {
        $normalized = str_replace(['\r\n', '\r', '\n'], "\n", $content);
        $lines = preg_split('/\r\n|\r|\n/', trim($normalized));
        if (empty($lines)) {
            return [];
        }

        // Fetch courses for this department
        $courses = Course::where('department_id', $departmentId)->get();
        Log::info("parseSpreadsheetData: deptId={$departmentId}, coursesCount=" . $courses->count());
        // Fetch 30 checklist items
        $checklistItems = ChecklistItem::orderBy('item_no')->get();

        $rows = [];
        $headerDetected = false;
        $colMap = [
            'course' => null,
            'item' => null,
            'link' => null,
            'lecturer' => null,
            'notes' => null,
        ];

        foreach ($lines as $index => $line) {
            $line = trim($line);
            if (empty($line)) continue;

            $separator = str_contains($line, "\t") ? "\t" : ",";
            $cols = str_getcsv($line, $separator, '"', '\\');
            $cols = array_map('trim', $cols);

            // Detect header on first row
            if (!$headerDetected) {
                foreach ($cols as $idx => $headerText) {
                    $norm = strtolower($headerText);
                    if (str_contains($norm, 'kode') || str_contains($norm, 'mata kuliah') || str_contains($norm, 'matakuliah') || str_contains($norm, 'mk')) {
                        $colMap['course'] = $idx;
                    } elseif (str_contains($norm, 'dokumen') || str_contains($norm, 'kategori') || str_contains($norm, 'jenis') || str_contains($norm, 'perangkat')) {
                        $colMap['item'] = $idx;
                    } elseif (str_contains($norm, 'drive') || str_contains($norm, 'link') || str_contains($norm, 'tautan') || str_contains($norm, 'url')) {
                        $colMap['link'] = $idx;
                    } elseif (str_contains($norm, 'dosen') || str_contains($norm, 'pengampu') || str_contains($norm, 'nama')) {
                        $colMap['lecturer'] = $idx;
                    } elseif (str_contains($norm, 'catatan') || str_contains($norm, 'keterangan') || str_contains($norm, 'note')) {
                        $colMap['notes'] = $idx;
                    }
                }

                // If link column detected, assume this line was the header
                if ($colMap['link'] !== null) {
                    $headerDetected = true;
                    continue;
                }
            }

            // Fallback column indexing if no header detected
            $courseInput = $cols[$colMap['course'] ?? 0] ?? '';
            $itemInput = $cols[$colMap['item'] ?? 1] ?? '';
            $linkInput = $cols[$colMap['link'] ?? 2] ?? '';
            $lecturerInput = $cols[$colMap['lecturer'] ?? 3] ?? '';
            $notesInput = $cols[$colMap['notes'] ?? 4] ?? '';

            // If only 3 columns: Course, Item, Link
            if (empty($linkInput) && count($cols) >= 3) {
                foreach ($cols as $cVal) {
                    if (str_contains($cVal, 'http')) {
                        $linkInput = $cVal;
                        break;
                    }
                }
            }

            if (empty($linkInput) && empty($courseInput) && empty($itemInput)) {
                continue;
            }

            // Match Course
            $matchedCourse = null;
            if (!empty($courseInput)) {
                $cleanCourse = strtolower(str_replace(['-', '_', ' '], '', $courseInput));
                $matchedCourse = $courses->first(function ($c) use ($cleanCourse, $courseInput) {
                    $cCode = strtolower(str_replace(['-', '_', ' '], '', $c->code));
                    $cName = strtolower($c->name);
                    return str_contains($cleanCourse, $cCode) || str_contains(strtolower($courseInput), $cName);
                });
            }

            // Match Checklist Item
            $matchedItem = null;
            if (!empty($itemInput)) {
                $cleanItem = strtolower($itemInput);
                $matchedItem = $checklistItems->first(function ($item) use ($cleanItem) {
                    $name = strtolower($item->document_name);
                    $sub = strtolower($item->subfolder);
                    $code = strtolower($item->code);

                    if ($cleanItem === $code || str_contains($cleanItem, $code)) return true;
                    if (str_contains($cleanItem, 'silabus') && str_contains($sub, 'silabus')) return true;
                    if ((str_contains($cleanItem, 'rps') || str_contains($cleanItem, 'rencana')) && str_contains($sub, 'rencana')) return true;
                    if (str_contains($cleanItem, 'hadir') && str_contains($sub, 'hadir')) return true;
                    if (str_contains($cleanItem, 'jurnal') && str_contains($sub, 'jurnal')) return true;
                    if (str_contains($cleanItem, 'kontrak') && str_contains($sub, 'kontrak')) return true;
                    if (str_contains($cleanItem, 'materi') && str_contains($sub, 'materi')) return true;
                    if (str_contains($cleanItem, 'soal') && str_contains($sub, 'soal')) return true;
                    if (str_contains($cleanItem, 'praktikum') && str_contains($sub, 'praktikum')) return true;
                    if ((str_contains($cleanItem, 'nilai') || str_contains($cleanItem, 'penilaian')) && str_contains($sub, 'penilaian')) return true;

                    return str_contains($name, $cleanItem) || str_contains($cleanItem, $name);
                });
            }

            // Default fallback to RPS if course specified but item missing
            if ($matchedCourse && !$matchedItem) {
                $matchedItem = $checklistItems->firstWhere('code', '01b');
            }

            $parsedUrl = $this->parseDriveUrl($linkInput);

            $rows[] = [
                'raw_line_no' => $index + 1,
                'course_input' => $courseInput,
                'matched_course_id' => $matchedCourse?->id,
                'matched_course_code' => $matchedCourse?->code,
                'matched_course_name' => $matchedCourse?->name,
                'item_input' => $itemInput,
                'matched_item_id' => $matchedItem?->id,
                'matched_item_code' => $matchedItem?->code,
                'matched_item_name' => $matchedItem?->document_name,
                'link_input' => $linkInput,
                'is_valid_drive_link' => $parsedUrl['is_valid'],
                'drive_type' => $parsedUrl['type'],
                'lecturer' => $lecturerInput ?: ($matchedCourse?->lecturer_name ?? 'Dosen Pengampu'),
                'notes' => $notesInput,
                'can_import' => ($matchedItem !== null && $parsedUrl['is_valid']),
            ];
        }

        return $rows;
    }

    /**
     * Copy or write document information into the Git repository workspace.
     */
    public function syncToGitRepo(DocumentFile $document, string $deptCode = 'TIF'): bool
    {
        try {
            $gitBaseDir = '/var/www/github-repo';
            if (!is_dir($gitBaseDir)) {
                $gitBaseDir = base_path('../Github');
            }
            if (!is_dir($gitBaseDir)) {
                $gitBaseDir = '/home/andy/VibeCoding/ISO21001-webapp/Github';
            }

            if (!is_dir($gitBaseDir)) {
                Log::warning("Direktori repositori Git tidak ditemukan di: {$gitBaseDir}");
                return false;
            }

            $prodiFolder = strtolower($deptCode) === 'tif' ? 'teknik-informatika' : 'teknik-industri';
            $checklistItem = $document->checklistItem;
            if (!$checklistItem) return false;

            $targetDir = "{$gitBaseDir}/prodi/{$prodiFolder}";

            if ($checklistItem->is_per_course && $document->course) {
                $course = $document->course;
                $courseFolderName = "{$course->code}_" . Str::slug($course->name);
                $subfolder = basename($checklistItem->subfolder);
                $targetDir .= "/01_Kurikulum/Perangkat-Perkuliahan/{$subfolder}/{$courseFolderName}";
            } else {
                $rootFolder = $checklistItem->root_folder;
                $subfolder = $checklistItem->subfolder == '(root folder)' ? '' : $checklistItem->subfolder;
                $targetDir .= "/{$rootFolder}" . ($subfolder ? "/{$subfolder}" : '');
            }

            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }

            // If physical file exists, copy it
            if ($document->storage_path && Storage::disk('public')->exists($document->storage_path)) {
                $sourcePath = Storage::disk('public')->path($document->storage_path);
                $destFileName = $document->original_name ?: $document->file_name;
                copy($sourcePath, "{$targetDir}/{$destFileName}");
            }

            // Write metadata/link file if it has Google Drive URL
            if ($document->drive_url) {
                $metaContent = "# Tautan Bukti Dokumen ISO 21001 (Google Drive)\n\n"
                    . "- **Dokumen**: {$document->title}\n"
                    . "- **Klausul ISO 21001**: {$checklistItem->iso_clause}\n"
                    . "- **Kode Mata Kuliah**: " . ($document->course?->code ?? '-') . "\n"
                    . "- **Mata Kuliah**: " . ($document->course?->name ?? '-') . "\n"
                    . "- **Pengunggah / Dosen**: {$document->uploaded_by}\n"
                    . "- **Status Audit**: {$document->status}\n"
                    . "- **Tanggal Input**: " . now()->format('Y-m-d H:i:s') . "\n"
                    . "- **Tautan Google Drive**: {$document->drive_url}\n\n"
                    . "> *Dokumen ini tersimpan secara aman di Google Drive institusi sesuai kepatuhan privasi (UU PDP).*";

                file_put_contents("{$targetDir}/LINK_GOOGLE_DRIVE.md", $metaContent);
            }

            $document->update([
                'sync_to_git' => true,
                'last_synced_at' => now(),
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::error("Git sync failed for doc #{$document->id}: " . $e->getMessage());
            return false;
        }
    }
}
