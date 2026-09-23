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
use Illuminate\Support\Str;

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

        // 4. Scaffold Folders and Seed Sample Documents for all departments
        $period = AcademicPeriod::where('code', '20252')->first() ?: AcademicPeriod::first();

        if ($period) {
            $scaffolder = new FolderScaffoldService();
            foreach (Department::all() as $dept) {
                $scaffolder->scaffold($period, $dept);
                $this->seedSampleDocuments($period, $dept);
            }
        }
    }

    public function seedSampleDocuments(AcademicPeriod $period, Department $dept): void
    {
        $deptCode = $dept->code;
        $deptName = $dept->name;
        $courses = Course::where('department_id', $dept->id)->where('academic_period_id', $period->id)->get();

        // 1. Root Folder Documents
        // Item 1: Kurikulum (01)
        $item1 = ChecklistItem::where('item_no', 1)->first();
        if ($item1) {
            $curriculumPath = "documents/{$period->code}/{$deptCode}/01_Kurikulum/Kurikulum_OBE_{$deptCode}_2024-2029_Disahkan.pdf";
            Storage::disk('public')->put($curriculumPath, "%PDF-1.4 Mock Kurikulum OBE {$deptName} Disahkan Senat FT");
            $doc1 = DocumentFile::updateOrCreate(
                ['checklist_item_id' => $item1->id, 'academic_period_id' => $period->id, 'department_id' => $dept->id, 'course_id' => null],
                [
                    'title' => "Buku Kurikulum OBE {$deptName} 2024-2029",
                    'file_name' => "Kurikulum_OBE_{$deptCode}_2024-2029_Disahkan.pdf",
                    'original_name' => "Kurikulum_OBE_{$deptCode}_2024-2029_Disahkan.pdf",
                    'storage_path' => $curriculumPath,
                    'mime_type' => 'application/pdf',
                    'file_size' => 2450000,
                    'file_hash' => hash('sha256', "mock_kurikulum_{$deptCode}"),
                    'current_version' => 'v2.0',
                    'status' => 'verified',
                    'is_digitally_signed' => true,
                    'uploaded_by' => 'Dr. Ir. Hendra Wicaksono, M.T.',
                    'notes' => 'Telah disahkan Senat Fakultas & Dekan FT.',
                ]
            );

            AuditVerification::updateOrCreate(
                ['document_file_id' => $doc1->id],
                [
                    'auditor_name' => 'Ir. Ratna Dewi Sartika, M.T.',
                    'audit_status' => 'compliant',
                    'iso_clause_ref' => '8.3.4.2; 8.3.4.3',
                    'finding_notes' => 'Struktur CPL dan pemetaan CPMK telah selaras dengan klausul 8.3.4 EOMS.',
                    'verified_at' => now()->subDays(2),
                ]
            );
        }

        // Item 2: SK Tim Kurikulum (01)
        $item2 = ChecklistItem::where('item_no', 2)->first();
        if ($item2) {
            $skPath = "documents/{$period->code}/{$deptCode}/01_Kurikulum/SK_Dekan_Tim_Kurikulum_{$deptCode}.pdf";
            Storage::disk('public')->put($skPath, "%PDF-1.4 Mock SK Tim Kurikulum {$deptName}");
            DocumentFile::updateOrCreate(
                ['checklist_item_id' => $item2->id, 'academic_period_id' => $period->id, 'department_id' => $dept->id, 'course_id' => null],
                [
                    'title' => "SK Dekan FT Tim Pengembang Kurikulum {$deptName}",
                    'file_name' => "SK_Dekan_Tim_Kurikulum_{$deptCode}.pdf",
                    'original_name' => "SK_Dekan_Tim_Kurikulum_{$deptCode}.pdf",
                    'storage_path' => $skPath,
                    'mime_type' => 'application/pdf',
                    'file_size' => 640000,
                    'file_hash' => hash('sha256', "mock_sk_{$deptCode}"),
                    'current_version' => 'v1.0',
                    'status' => 'verified',
                    'is_digitally_signed' => true,
                    'uploaded_by' => 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
                ]
            );
        }

        // Item 3: Notulen Review Kurikulum (01)
        $item3 = ChecklistItem::where('item_no', 3)->first();
        if ($item3) {
            $notulenPath = "documents/{$period->code}/{$deptCode}/01_Kurikulum/Notulen_Review_Kurikulum_{$deptCode}.pdf";
            Storage::disk('public')->put($notulenPath, "%PDF-1.4 Mock Notulen Review");
            DocumentFile::updateOrCreate(
                ['checklist_item_id' => $item3->id, 'academic_period_id' => $period->id, 'department_id' => $dept->id, 'course_id' => null],
                [
                    'title' => "Notulen Rapat Review Kurikulum Bersama Industri & Alumni",
                    'file_name' => "Notulen_Review_Kurikulum_{$deptCode}.pdf",
                    'original_name' => "Notulen_Review_Kurikulum_{$deptCode}.pdf",
                    'storage_path' => $notulenPath,
                    'mime_type' => 'application/pdf',
                    'file_size' => 890000,
                    'file_hash' => hash('sha256', "mock_notulen_{$deptCode}"),
                    'current_version' => 'v1.0',
                    'status' => 'verified',
                    'uploaded_by' => 'Dr. Ir. Hendra Wicaksono, M.T.',
                ]
            );
        }

        // 2. Skripsi (Items 13, 14, 16, 17)
        $item13 = ChecklistItem::where('item_no', 13)->first();
        if ($item13) {
            $skSkripsiPath = "documents/{$period->code}/{$deptCode}/02_Skripsi/a_SK-Pembimbing-dan-Penguji/SK_Pembimbing_Skripsi.pdf";
            Storage::disk('public')->put($skSkripsiPath, "%PDF-1.4 Mock SK Pembimbing");
            DocumentFile::updateOrCreate(
                ['checklist_item_id' => $item13->id, 'academic_period_id' => $period->id, 'department_id' => $dept->id, 'course_id' => null],
                [
                    'title' => "SK Dekan Penetapan Dosen Pembimbing & Penguji Skripsi {$deptName}",
                    'file_name' => 'SK_Pembimbing_Skripsi.pdf',
                    'original_name' => 'SK_Pembimbing_Skripsi.pdf',
                    'storage_path' => $skSkripsiPath,
                    'status' => 'verified',
                    'is_digitally_signed' => true,
                    'uploaded_by' => 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
                ]
            );
        }

        $item14 = ChecklistItem::where('item_no', 14)->first();
        if ($item14) {
            $panduanPath = "documents/{$period->code}/{$deptCode}/02_Skripsi/b_Buku-Panduan-Skripsi/Buku_Panduan_Skripsi.pdf";
            Storage::disk('public')->put($panduanPath, "%PDF-1.4 Mock Panduan Skripsi");
            DocumentFile::updateOrCreate(
                ['checklist_item_id' => $item14->id, 'academic_period_id' => $period->id, 'department_id' => $dept->id, 'course_id' => null],
                [
                    'title' => "Buku Panduan Penulisan & Sidang Skripsi {$deptName} 2025/2026",
                    'file_name' => 'Buku_Panduan_Skripsi.pdf',
                    'original_name' => 'Buku_Panduan_Skripsi.pdf',
                    'storage_path' => $panduanPath,
                    'status' => 'verified',
                    'uploaded_by' => 'Dr. Ir. Hendra Wicaksono, M.T.',
                ]
            );
        }

        $item16 = ChecklistItem::where('item_no', 16)->first();
        if ($item16) {
            $plagiasiPath = "documents/{$period->code}/{$deptCode}/02_Skripsi/d_Bukti-Cek-Plagiasi/Rekap_Cek_Plagiasi_Turnitin.pdf";
            Storage::disk('public')->put($plagiasiPath, "%PDF-1.4 Mock Turnitin");
            DocumentFile::updateOrCreate(
                ['checklist_item_id' => $item16->id, 'academic_period_id' => $period->id, 'department_id' => $dept->id, 'course_id' => null],
                [
                    'title' => "Rekapitulasi Skor Kemiripan Turnitin Skripsi Mahasiswa Periode Wisuda",
                    'file_name' => 'Rekap_Cek_Plagiasi_Turnitin.pdf',
                    'original_name' => 'Rekap_Cek_Plagiasi_Turnitin.pdf',
                    'storage_path' => $plagiasiPath,
                    'status' => 'submitted',
                    'uploaded_by' => 'Dr. Ir. Hendra Wicaksono, M.T.',
                    'notes' => 'Menunggu validasi hasil verifikasi oleh Lead Auditor.',
                ]
            );
        }

        // 3. Wisuda (Items 20, 21)
        $item20 = ChecklistItem::where('item_no', 20)->first();
        if ($item20) {
            $wisudaPath = "documents/{$period->code}/{$deptCode}/03_Wisuda/a_Bukti-Persyaratan-Wisuda/Syarat_Yudisium_Wisuda.pdf";
            Storage::disk('public')->put($wisudaPath, "%PDF-1.4 Mock Wisuda");
            DocumentFile::updateOrCreate(
                ['checklist_item_id' => $item20->id, 'academic_period_id' => $period->id, 'department_id' => $dept->id, 'course_id' => null],
                [
                    'title' => "Pedoman Persyaratan Bebas Pustaka & Yudisium Wisuda {$deptName}",
                    'file_name' => 'Syarat_Yudisium_Wisuda.pdf',
                    'original_name' => 'Syarat_Yudisium_Wisuda.pdf',
                    'storage_path' => $wisudaPath,
                    'status' => 'verified',
                    'uploaded_by' => 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
                ]
            );
        }

        $item21 = ChecklistItem::where('item_no', 21)->first();
        if ($item21) {
            $pddiktiPath = "documents/{$period->code}/{$deptCode}/03_Wisuda/b_Pelaporan-Kelulusan-PDDIKTI/Laporan_Kelulusan_PDDIKTI.pdf";
            Storage::disk('public')->put($pddiktiPath, "%PDF-1.4 Mock PDDIKTI");
            DocumentFile::updateOrCreate(
                ['checklist_item_id' => $item21->id, 'academic_period_id' => $period->id, 'department_id' => $dept->id, 'course_id' => null],
                [
                    'title' => "Bukti Laporan Rekap Kelulusan Mahasiswa pada Feeder PDDIKTI",
                    'file_name' => 'Laporan_Kelulusan_PDDIKTI.pdf',
                    'original_name' => 'Laporan_Kelulusan_PDDIKTI.pdf',
                    'storage_path' => $pddiktiPath,
                    'status' => 'verified',
                    'uploaded_by' => 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
                ]
            );
        }

        // 4. Evaluasi & Akreditasi (Items 23, 24, 26)
        $item23 = ChecklistItem::where('item_no', 23)->first();
        if ($item23) {
            $akreditasiPath = "documents/{$period->code}/{$deptCode}/04_Evaluasi-dan-Akreditasi/a_Sertifikat-Akreditasi-BAN-PT-LAM/Sertifikat_Akreditasi_{$deptCode}.pdf";
            Storage::disk('public')->put($akreditasiPath, "%PDF-1.4 Mock Sertifikat Akreditasi");
            DocumentFile::updateOrCreate(
                ['checklist_item_id' => $item23->id, 'academic_period_id' => $period->id, 'department_id' => $dept->id, 'course_id' => null],
                [
                    'title' => "Sertifikat Akreditasi Peringkat Unggul {$deptName}",
                    'file_name' => "Sertifikat_Akreditasi_{$deptCode}.pdf",
                    'original_name' => "Sertifikat_Akreditasi_{$deptCode}.pdf",
                    'storage_path' => $akreditasiPath,
                    'status' => 'verified',
                    'is_digitally_signed' => true,
                    'uploaded_by' => 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
                ]
            );
        }

        $item24 = ChecklistItem::where('item_no', 24)->first();
        if ($item24) {
            $surveiPath = "documents/{$period->code}/{$deptCode}/04_Evaluasi-dan-Akreditasi/b_Survei-Kepuasan-Interested-Parties/Laporan_Survei_Kepuasan.pdf";
            Storage::disk('public')->put($surveiPath, "%PDF-1.4 Mock Survei");
            DocumentFile::updateOrCreate(
                ['checklist_item_id' => $item24->id, 'academic_period_id' => $period->id, 'department_id' => $dept->id, 'course_id' => null],
                [
                    'title' => "Laporan Survei Kepuasan Mahasiswa, Dosen & Pengguna Lulusan",
                    'file_name' => 'Laporan_Survei_Kepuasan.pdf',
                    'original_name' => 'Laporan_Survei_Kepuasan.pdf',
                    'storage_path' => $surveiPath,
                    'status' => 'verified',
                    'uploaded_by' => 'Dr. Ir. Hendra Wicaksono, M.T.',
                ]
            );
        }

        $item26 = ChecklistItem::where('item_no', 26)->first();
        if ($item26) {
            $edomPath = "documents/{$period->code}/{$deptCode}/04_Evaluasi-dan-Akreditasi/d_EDOM-Semester-Genap-Terakhir/Laporan_EDOM.pdf";
            Storage::disk('public')->put($edomPath, "%PDF-1.4 Mock EDOM");
            DocumentFile::updateOrCreate(
                ['checklist_item_id' => $item26->id, 'academic_period_id' => $period->id, 'department_id' => $dept->id, 'course_id' => null],
                [
                    'title' => "Laporan Evaluasi Dosen oleh Mahasiswa (EDOM) Semester Genap",
                    'file_name' => 'Laporan_EDOM.pdf',
                    'original_name' => 'Laporan_EDOM.pdf',
                    'storage_path' => $edomPath,
                    'status' => 'verified',
                    'uploaded_by' => 'Dr. Ir. Hendra Wicaksono, M.T.',
                ]
            );
        }

        // 5. Penelitian & PkM (Items 29, 30)
        $item29 = ChecklistItem::where('item_no', 29)->first();
        if ($item29) {
            $roadmapPath = "documents/{$period->code}/{$deptCode}/05_Penelitian-dan-PkM/a_Blueprint-Penelitian-dan-PkM/Roadmap_Penelitian.pdf";
            Storage::disk('public')->put($roadmapPath, "%PDF-1.4 Mock Roadmap");
            DocumentFile::updateOrCreate(
                ['checklist_item_id' => $item29->id, 'academic_period_id' => $period->id, 'department_id' => $dept->id, 'course_id' => null],
                [
                    'title' => "Blueprint & Roadmap Riset Unggulan {$deptName} 2024-2029",
                    'file_name' => 'Roadmap_Penelitian.pdf',
                    'original_name' => 'Roadmap_Penelitian.pdf',
                    'storage_path' => $roadmapPath,
                    'status' => 'verified',
                    'uploaded_by' => 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
                ]
            );
        }

        // 6. Course-Specific Perangkat Documents for Courses
        $itemSilabus = ChecklistItem::where('code', '01a')->first();
        $itemRps = ChecklistItem::where('code', '01b')->first();
        $itemPresensi = ChecklistItem::where('code', '01c')->first();
        $itemJurnal = ChecklistItem::where('code', '01d')->first();
        $itemKontrak = ChecklistItem::where('code', '01e')->first();
        $itemMateri = ChecklistItem::where('code', '01f')->first();
        $itemSoal = ChecklistItem::where('code', '01g')->first();
        $itemPraktikum = ChecklistItem::where('code', '01h')->first();
        $itemNilai = ChecklistItem::where('code', '01i')->first();

        foreach ($courses as $idx => $c) {
            $cSlug = "{$c->code}_" . Str::limit(Str::slug($c->name), 40, '');

            // Non-practicum auto-exemption
            if (!$c->has_practicum && $itemPraktikum) {
                DocumentFile::updateOrCreate(
                    ['checklist_item_id' => $itemPraktikum->id, 'course_id' => $c->id, 'department_id' => $dept->id, 'academic_period_id' => $period->id],
                    [
                        'title' => "Pedoman Praktikum - Non-Praktikum (N/A) [{$c->code}]",
                        'file_name' => '',
                        'original_name' => '',
                        'storage_path' => '',
                        'status' => 'not_applicable',
                        'notes' => "Mata kuliah teori ({$c->code}), tidak memerlukan modul praktikum.",
                    ]
                );
            }

            // For the first 6 courses, seed verified/submitted documents
            if ($idx < 6) {
                // Silabus
                if ($itemSilabus) {
                    $sSilabus = "documents/{$period->code}/{$deptCode}/01_Kurikulum/Perangkat-Perkuliahan/{$cSlug}/a_Silabus/Silabus_{$c->code}.pdf";
                    Storage::disk('public')->put($sSilabus, "%PDF-1.4 Silabus {$c->name}");
                    DocumentFile::updateOrCreate(
                        ['checklist_item_id' => $itemSilabus->id, 'course_id' => $c->id, 'department_id' => $dept->id, 'academic_period_id' => $period->id],
                        [
                            'title' => "Silabus {$c->code} - {$c->name}",
                            'file_name' => "Silabus_{$c->code}.pdf",
                            'original_name' => "Silabus_{$c->code}.pdf",
                            'storage_path' => $sSilabus,
                            'status' => 'verified',
                            'uploaded_by' => $c->lecturer_name ?: 'Dosen Pengampu',
                        ]
                    );
                }

                // RPS
                if ($itemRps) {
                    $sRps = "documents/{$period->code}/{$deptCode}/01_Kurikulum/Perangkat-Perkuliahan/{$cSlug}/b_RencanaPembelajaran/RPS_{$c->code}.pdf";
                    Storage::disk('public')->put($sRps, "%PDF-1.4 RPS {$c->name}");
                    $docRps = DocumentFile::updateOrCreate(
                        ['checklist_item_id' => $itemRps->id, 'course_id' => $c->id, 'department_id' => $dept->id, 'academic_period_id' => $period->id],
                        [
                            'title' => "RPS {$c->code} - {$c->name}",
                            'file_name' => "RPS_{$c->code}.pdf",
                            'original_name' => "RPS_{$c->code}.pdf",
                            'storage_path' => $sRps,
                            'status' => 'verified',
                            'is_digitally_signed' => true,
                            'uploaded_by' => $c->lecturer_name ?: 'Dosen Pengampu',
                        ]
                    );

                    AuditComment::firstOrCreate(
                        ['document_file_id' => $docRps->id],
                        [
                            'sender_name' => 'Ir. Ratna Dewi Sartika, M.T.',
                            'sender_role' => 'Auditor Mutu',
                            'message' => "RPS mata kuliah {$c->code} telah memenuhi klausul 8.1.2 dan rubrik OBE 8.3.4.3.",
                        ]
                    );
                }

                // Presensi
                if ($itemPresensi) {
                    $sPresensi = "documents/{$period->code}/{$deptCode}/01_Kurikulum/Perangkat-Perkuliahan/{$cSlug}/c_Daftar-HadirPerkuliahan/Presensi_{$c->code}.pdf";
                    Storage::disk('public')->put($sPresensi, "%PDF-1.4 Presensi {$c->name}");
                    DocumentFile::updateOrCreate(
                        ['checklist_item_id' => $itemPresensi->id, 'course_id' => $c->id, 'department_id' => $dept->id, 'academic_period_id' => $period->id],
                        [
                            'title' => "Daftar Hadir Perkuliahan (16 Pertemuan) {$c->code}",
                            'file_name' => "Presensi_{$c->code}.pdf",
                            'original_name' => "Presensi_{$c->code}.pdf",
                            'storage_path' => $sPresensi,
                            'status' => 'verified',
                            'uploaded_by' => $c->lecturer_name ?: 'Dosen Pengampu',
                        ]
                    );
                }

                // Kontrak Belajar
                if ($itemKontrak) {
                    $sKontrak = "documents/{$period->code}/{$deptCode}/01_Kurikulum/Perangkat-Perkuliahan/{$cSlug}/e_Kontrak-Belajar/Kontrak_{$c->code}.pdf";
                    Storage::disk('public')->put($sKontrak, "%PDF-1.4 Kontrak {$c->name}");
                    DocumentFile::updateOrCreate(
                        ['checklist_item_id' => $itemKontrak->id, 'course_id' => $c->id, 'department_id' => $dept->id, 'academic_period_id' => $period->id],
                        [
                            'title' => "Kontrak Perkuliahan {$c->code}",
                            'file_name' => "Kontrak_{$c->code}.pdf",
                            'original_name' => "Kontrak_{$c->code}.pdf",
                            'storage_path' => $sKontrak,
                            'status' => 'verified',
                            'uploaded_by' => $c->lecturer_name ?: 'Dosen Pengampu',
                        ]
                    );
                }

                // If practicum, seed Pedoman Praktikum
                if ($c->has_practicum && $itemPraktikum) {
                    $sPraktikum = "documents/{$period->code}/{$deptCode}/01_Kurikulum/Perangkat-Perkuliahan/{$cSlug}/h_PedomanPraktikum/Modul_Praktikum_{$c->code}.pdf";
                    Storage::disk('public')->put($sPraktikum, "%PDF-1.4 Modul Praktikum {$c->name}");
                    DocumentFile::updateOrCreate(
                        ['checklist_item_id' => $itemPraktikum->id, 'course_id' => $c->id, 'department_id' => $dept->id, 'academic_period_id' => $period->id],
                        [
                            'title' => "Buku Panduan / Modul Praktikum {$c->code}",
                            'file_name' => "Modul_Praktikum_{$c->code}.pdf",
                            'original_name' => "Modul_Praktikum_{$c->code}.pdf",
                            'storage_path' => $sPraktikum,
                            'status' => 'verified',
                            'uploaded_by' => $c->lecturer_name ?: 'Dosen Pengampu',
                        ]
                    );
                }

                // Add 1 NCR for Course 1 (Soal UTS/UAS)
                if ($idx === 0 && $itemSoal) {
                    $sSoal = "documents/{$period->code}/{$deptCode}/01_Kurikulum/Perangkat-Perkuliahan/{$cSlug}/g_Soal-UTS-UASdan-Verifikasi/Naskah_Soal_UTS_{$c->code}.pdf";
                    Storage::disk('public')->put($sSoal, "%PDF-1.4 Naskah Soal UTS {$c->name}");
                    $docSoal = DocumentFile::updateOrCreate(
                        ['checklist_item_id' => $itemSoal->id, 'course_id' => $c->id, 'department_id' => $dept->id, 'academic_period_id' => $period->id],
                        [
                            'title' => "Naskah Soal UTS & Lembar Verifikasi {$c->code}",
                            'file_name' => "Naskah_Soal_UTS_{$c->code}.pdf",
                            'original_name' => "Naskah_Soal_UTS_{$c->code}.pdf",
                            'storage_path' => $sSoal,
                            'status' => 'needs_revision',
                            'uploaded_by' => $c->lecturer_name ?: 'Dosen Pengampu',
                            'notes' => 'Lembar verifikasi soal dari KBK belum ditandatangani koordinator.',
                        ]
                    );

                    AuditVerification::updateOrCreate(
                        ['document_file_id' => $docSoal->id],
                        [
                            'auditor_name' => 'Ir. Ratna Dewi Sartika, M.T.',
                            'audit_status' => 'minor_observation',
                            'iso_clause_ref' => '8.3.4.3 & 8.5.1',
                            'finding_notes' => 'Lembar telaah/verifikasi soal ujian oleh Kelompok Bidang Keahlian (KBK) belum lengkap tanda tangan pengesahan.',
                            'verified_at' => now()->subDay(),
                        ]
                    );

                    AuditComment::create([
                        'document_file_id' => $docSoal->id,
                        'sender_name' => 'Ir. Ratna Dewi Sartika, M.T.',
                        'sender_role' => 'Auditor Mutu',
                        'message' => 'Mohon unggah ulang naskah soal yang disertai form verifikasi telaah KBK ber-ttd.',
                    ]);
                }
            }
        }
    }
}
