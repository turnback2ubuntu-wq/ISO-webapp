<?php

namespace Database\Seeders;

use App\Models\AcademicPeriod;
use App\Models\AuditComment;
use App\Models\AuditVerification;
use App\Models\ChecklistItem;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentFile;
use App\Models\DocumentVersion;
use App\Models\User;
use App\Services\FolderScaffoldService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed users
        User::firstOrCreate(
            ['email' => 'gpm@ft-iso21001.ac.id'],
            [
                'name' => 'Dr. Ir. Hendra Wicaksono, M.T.',
                'password' => Hash::make('password'),
            ]
        );

        User::firstOrCreate(
            ['email' => 'kaprodi@ft-iso21001.ac.id'],
            [
                'name' => 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
                'password' => Hash::make('password'),
            ]
        );

        User::firstOrCreate(
            ['email' => 'auditor@ft-iso21001.ac.id'],
            [
                'name' => 'Ir. Ratna Dewi Sartika, M.T.',
                'password' => Hash::make('password'),
            ]
        );

        // 2. Seed Academic Period, Departments & Courses
        $this->call(AcademicAndDepartmentSeeder::class);

        // 3. Seed 30 Checklist Items from PDF
        $this->call(ChecklistPoin7Seeder::class);

        // 4. Scaffold Folders
        $period = AcademicPeriod::where('code', '20252')->first();
        $dept = Department::where('code', 'TIND')->first();

        if ($period && $dept) {
            $scaffolder = new FolderScaffoldService();
            $scaffolder->scaffold($period, $dept);

            // 5. Seed some initial sample documents
            $this->seedSampleDocuments($period, $dept);
        }
    }

    private function seedSampleDocuments(AcademicPeriod $period, Department $dept): void
    {
        // Sample 1: Kurikulum yang dipakai saat ini (01)
        $item1 = ChecklistItem::where('item_no', 1)->first();
        if ($item1) {
            $samplePdfPath = "documents/{$period->code}/{$dept->code}/01_Kurikulum/Kurikulum_OBE_Teknik_Industri_2025_Disahkan.pdf";
            Storage::disk('public')->put($samplePdfPath, "%PDF-1.4 Mock Kurikulum OBE S1 Teknik Industri Genap 2025/2026 Disahkan Dekan Fakultas Teknik");

            $doc1 = DocumentFile::updateOrCreate(
                [
                    'checklist_item_id' => $item1->id,
                    'academic_period_id' => $period->id,
                    'department_id' => $dept->id,
                    'course_id' => null,
                ],
                [
                    'title' => 'Buku Kurikulum OBE S1 Teknik Industri 2024-2029',
                    'file_name' => 'Kurikulum_OBE_Teknik_Industri_2025_Disahkan.pdf',
                    'original_name' => 'Kurikulum_OBE_Teknik_Industri_2025_Disahkan.pdf',
                    'storage_path' => $samplePdfPath,
                    'mime_type' => 'application/pdf',
                    'file_size' => 1245000,
                    'file_hash' => hash('sha256', 'mock_kurikulum_obe'),
                    'current_version' => 'v2.0',
                    'status' => 'verified',
                    'is_digitally_signed' => true,
                    'uploaded_by' => 'Dr. Ir. Hendra Wicaksono, M.T.',
                    'notes' => 'Telah disahkan Senat Fakultas & Dekan FT pada 15 Januari 2026',
                ]
            );

            DocumentVersion::firstOrCreate(
                ['document_file_id' => $doc1->id, 'version_number' => 'v2.0'],
                [
                    'storage_path' => $samplePdfPath,
                    'original_name' => 'Kurikulum_OBE_Teknik_Industri_2025_Disahkan.pdf',
                    'file_size' => 1245000,
                    'file_hash' => hash('sha256', 'mock_kurikulum_obe'),
                    'changelog' => 'Penyesuaian CPL berbasis standar IABEE dan ISO 21001:2018',
                    'uploaded_by' => 'Dr. Ir. Hendra Wicaksono, M.T.',
                ]
            );

            AuditVerification::firstOrCreate(
                ['document_file_id' => $doc1->id],
                [
                    'auditor_name' => 'Ir. Ratna Dewi Sartika, M.T.',
                    'audit_status' => 'compliant',
                    'iso_clause_ref' => '8.3.4.2; 8.3.4.3',
                    'finding_notes' => 'Dokumen sah, matriks CPL dan CPMK lengkap sesuai klausul 8.3.4',
                    'verified_at' => now()->subDays(2),
                ]
            );
        }

        // Sample 2: SK Pembentukan Tim Kurikulum (01)
        $item2 = ChecklistItem::where('item_no', 2)->first();
        if ($item2) {
            $samplePdf2 = "documents/{$period->code}/{$dept->code}/01_Kurikulum/SK_Dekan_Tim_Kurikulum_2025.pdf";
            Storage::disk('public')->put($samplePdf2, "%PDF-1.4 Mock SK Tim Kurikulum");

            DocumentFile::updateOrCreate(
                [
                    'checklist_item_id' => $item2->id,
                    'academic_period_id' => $period->id,
                    'department_id' => $dept->id,
                    'course_id' => null,
                ],
                [
                    'title' => 'SK Dekan FT No. 102/FT/SK/2025 Tim Pengembang Kurikulum',
                    'file_name' => 'SK_Dekan_Tim_Kurikulum_2025.pdf',
                    'original_name' => 'SK_Dekan_Tim_Kurikulum_2025.pdf',
                    'storage_path' => $samplePdf2,
                    'mime_type' => 'application/pdf',
                    'file_size' => 840200,
                    'file_hash' => hash('sha256', 'mock_sk_tim'),
                    'current_version' => 'v1.0',
                    'status' => 'verified',
                    'is_digitally_signed' => true,
                    'uploaded_by' => 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
                    'notes' => 'Masa berlaku SK: 2025 - 2027',
                ]
            );
        }

        // Sample 3: RPS Perencanaan & Pengendalian Produksi (01b)
        $itemRps = ChecklistItem::where('code', '01b')->first();
        $coursePpic = Course::where('code', 'TIND-301')->first();
        if ($itemRps && $coursePpic) {
            $sampleRpsPath = "documents/{$period->code}/{$dept->code}/01_Kurikulum/Perangkat-Perkuliahan/TIND-301_ppic/b_RencanaPembelajaran/RPS_PPIC_Genap20252026.pdf";
            Storage::disk('public')->put($sampleRpsPath, "%PDF-1.4 Mock RPS PPIC Disahkan");

            $docRps = DocumentFile::updateOrCreate(
                [
                    'checklist_item_id' => $itemRps->id,
                    'academic_period_id' => $period->id,
                    'department_id' => $dept->id,
                    'course_id' => $coursePpic->id,
                ],
                [
                    'title' => 'RPS Perencanaan & Pengendalian Produksi (TIND-301) Genap 2025/2026',
                    'file_name' => 'RPS_PPIC_Genap20252026.pdf',
                    'original_name' => 'RPS_PPIC_Genap20252026.pdf',
                    'storage_path' => $sampleRpsPath,
                    'mime_type' => 'application/pdf',
                    'file_size' => 960000,
                    'file_hash' => hash('sha256', 'mock_rps_ppic'),
                    'current_version' => 'v1.0',
                    'status' => 'verified',
                    'is_digitally_signed' => true,
                    'uploaded_by' => 'Dr. Ir. Hendra Wicaksono, M.T.',
                    'notes' => 'Lengkap 16 minggu perkuliahan dengan asesmen rubrik OBE',
                ]
            );

            AuditComment::firstOrCreate(
                ['document_file_id' => $docRps->id],
                [
                    'sender_name' => 'Ir. Ratna Dewi Sartika, M.T.',
                    'sender_role' => 'Auditor Mutu',
                    'message' => 'RPS telah memenuhi standar klausul 8.3.4.3 dan 8.1.2. Bobot evaluasi selaras dengan CPL.',
                ]
            );
        }

        // Sample 4: Silabus PPIC (01a)
        $itemSilabus = ChecklistItem::where('code', '01a')->first();
        if ($itemSilabus && $coursePpic) {
            $sampleSilabus = "documents/{$period->code}/{$dept->code}/01_Kurikulum/Perangkat-Perkuliahan/TIND-301_ppic/a_Silabus/Silabus_PPIC_2026.pdf";
            Storage::disk('public')->put($sampleSilabus, "%PDF-1.4 Mock Silabus PPIC");

            DocumentFile::updateOrCreate(
                [
                    'checklist_item_id' => $itemSilabus->id,
                    'academic_period_id' => $period->id,
                    'department_id' => $dept->id,
                    'course_id' => $coursePpic->id,
                ],
                [
                    'title' => 'Silabus Ringkas TIND-301',
                    'file_name' => 'Silabus_PPIC_2026.pdf',
                    'original_name' => 'Silabus_PPIC_2026.pdf',
                    'storage_path' => $sampleSilabus,
                    'mime_type' => 'application/pdf',
                    'file_size' => 450000,
                    'file_hash' => hash('sha256', 'mock_silabus_ppic'),
                    'current_version' => 'v1.0',
                    'status' => 'verified',
                    'uploaded_by' => 'Dr. Ir. Hendra Wicaksono, M.T.',
                ]
            );
        }

        // Sample 5: Non-practicum auto-exemption for TIND-301 (01h)
        $itemPraktikum = ChecklistItem::where('code', '01h')->first();
        if ($itemPraktikum && $coursePpic) {
            DocumentFile::updateOrCreate(
                [
                    'checklist_item_id' => $itemPraktikum->id,
                    'academic_period_id' => $period->id,
                    'department_id' => $dept->id,
                    'course_id' => $coursePpic->id,
                ],
                [
                    'title' => 'Pedoman Praktikum - Non-Praktikum (N/A)',
                    'file_name' => '',
                    'original_name' => '',
                    'storage_path' => '',
                    'status' => 'not_applicable',
                    'notes' => "Pilih 'Tidak berlaku' karena TIND-301 mata kuliah teori.",
                ]
            );
        }
    }
}
