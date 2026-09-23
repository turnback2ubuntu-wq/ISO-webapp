<?php

namespace Database\Seeders;

use App\Models\AcademicPeriod;
use App\Models\Course;
use App\Models\Department;
use Illuminate\Database\Seeder;

class AcademicAndDepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Academic Period: Genap 2025/2026
        $period = AcademicPeriod::firstOrCreate(
            ['code' => '20252'],
            [
                'name' => 'Semester Genap 2025/2026',
                'is_active' => true,
                'audit_target_date' => '2026-04-06',
                'notes' => 'Periode Audit Sertifikasi Tahap 1 ISO 21001:2018 Fakultas Teknik',
            ]
        );

        // 2. Department: Teknik Industri (TIND) & Teknik Informatika (TIF)
        $tind = Department::firstOrCreate(
            ['code' => 'TIND'],
            [
                'name' => 'Teknik Industri',
                'faculty' => 'Fakultas Teknik',
                'degree' => 'S1',
            ]
        );

        $tif = Department::firstOrCreate(
            ['code' => 'TIF'],
            [
                'name' => 'Teknik Informatika',
                'faculty' => 'Fakultas Teknik',
                'degree' => 'S1',
            ]
        );

        // 3. Courses for Teknik Industri (TIND) Semester Genap 2025/2026
        $courses = [
            [
                'code' => 'TIND-301',
                'name' => 'Perencanaan & Pengendalian Produksi',
                'credits' => 3,
                'semester' => 6,
                'lecturer_name' => 'Dr. Ir. Hendra Wicaksono, M.T.',
                'has_practicum' => false,
            ],
            [
                'code' => 'TIND-302',
                'name' => 'Ergonomi & Perancangan Sistem Kerja',
                'credits' => 3,
                'semester' => 4,
                'lecturer_name' => 'Ir. Ratna Dewi Sartika, M.T.',
                'has_practicum' => true,
            ],
            [
                'code' => 'TIND-303',
                'name' => 'Penelitian Operasional II',
                'credits' => 3,
                'semester' => 4,
                'lecturer_name' => 'Prof. Dr. Eng. Satria Ramadhan, S.T., M.T.',
                'has_practicum' => false,
            ],
            [
                'code' => 'TIND-304',
                'name' => 'Otomasi Sistem Produksi & Robotika',
                'credits' => 3,
                'semester' => 6,
                'lecturer_name' => 'Ir. Bambang Suryono, M.T.',
                'has_practicum' => true,
            ],
            [
                'code' => 'TIND-305',
                'name' => 'Pengendalian & Penjaminan Mutu',
                'credits' => 3,
                'semester' => 6,
                'lecturer_name' => 'Dr. Alfian Nurlifa, S.T., M.Kom.',
                'has_practicum' => false,
            ],
            [
                'code' => 'TIND-306',
                'name' => 'Tata Letak Fasilitas & Pemindahan Bahan',
                'credits' => 4,
                'semester' => 6,
                'lecturer_name' => 'Ir. Dian Kusumawati, M.Eng.',
                'has_practicum' => true,
            ],
        ];

        foreach ($courses as $c) {
            Course::updateOrCreate(
                [
                    'department_id' => $tind->id,
                    'academic_period_id' => $period->id,
                    'code' => $c['code'],
                ],
                $c
            );
        }

        // 4. Courses for Teknik Informatika (TIF) Gasal 2026-2027
        $tifCourses = [
            ['code' => 'IF1302', 'name' => 'Pengantar Teknologi Informasi', 'credits' => 3, 'semester' => 1, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF330124', 'name' => 'Sistem Pendukung Keputusan', 'credits' => 3, 'semester' => 3, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF7606', 'name' => 'Kerja Praktek', 'credits' => 2, 'semester' => 7, 'lecturer_name' => 'Koordinator KP', 'has_practicum' => false],
            ['code' => 'IF530824', 'name' => 'Study Ekskursi', 'credits' => 2, 'semester' => 5, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF1303', 'name' => 'Arsitektur Komputer', 'credits' => 3, 'semester' => 1, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF7601', 'name' => 'Manajemen Perangkat Lunak', 'credits' => 3, 'semester' => 7, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF360424', 'name' => 'Konsep AI', 'credits' => 3, 'semester' => 3, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF1405', 'name' => 'Basis Data', 'credits' => 3, 'semester' => 1, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => true],
            ['code' => 'IF1404', 'name' => 'Algoritma dan Pemrograman Dasar', 'credits' => 4, 'semester' => 1, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => true],
            ['code' => 'IF340224', 'name' => 'Pemograman Java', 'credits' => 3, 'semester' => 3, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => true],
            ['code' => 'IF7605', 'name' => 'Perancangan dan Pengembangan Produk', 'credits' => 3, 'semester' => 7, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF7607', 'name' => 'Digital Entrepreneurship', 'credits' => 2, 'semester' => 7, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF530624', 'name' => 'Multimedia', 'credits' => 3, 'semester' => 5, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => true],
            ['code' => 'IF360524', 'name' => 'Interaksi Manusia dan Komputer', 'credits' => 3, 'semester' => 3, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF7602', 'name' => 'Interaksi Manusia dan Komputer', 'credits' => 3, 'semester' => 7, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF640424', 'name' => 'Statistik Teknik', 'credits' => 3, 'semester' => 6, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF7603', 'name' => 'Sistem Informasi Bisnis', 'credits' => 3, 'semester' => 7, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF360624', 'name' => 'Manjemen Perangkat Lunak', 'credits' => 3, 'semester' => 3, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF7604', 'name' => 'Etika Profesi', 'credits' => 2, 'semester' => 7, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF1201', 'name' => 'Matematika', 'credits' => 3, 'semester' => 1, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF350324', 'name' => 'Publik Speaking', 'credits' => 2, 'semester' => 3, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF520524', 'name' => 'Bahasa Inggris', 'credits' => 2, 'semester' => 5, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => false],
            ['code' => 'IF750124', 'name' => 'Sistem Informasi Geografis', 'credits' => 3, 'semester' => 7, 'lecturer_name' => 'Dosen TIF', 'has_practicum' => true],
            ['code' => 'UNV5104', 'name' => 'Kewarganegaraan', 'credits' => 2, 'semester' => 1, 'lecturer_name' => 'Dosen MKU', 'has_practicum' => false],
            ['code' => 'UNV5101', 'name' => 'Pancasila', 'credits' => 2, 'semester' => 1, 'lecturer_name' => 'Dosen MKU', 'has_practicum' => false],
            ['code' => 'UNV5103', 'name' => 'Agama', 'credits' => 2, 'semester' => 1, 'lecturer_name' => 'Dosen MKU', 'has_practicum' => false],
            ['code' => 'UNV5102', 'name' => 'Pengenalan PGRI', 'credits' => 2, 'semester' => 1, 'lecturer_name' => 'Dosen MKU', 'has_practicum' => false],
        ];

        foreach ($tifCourses as $c) {
            Course::updateOrCreate(
                [
                    'department_id' => $tif->id,
                    'academic_period_id' => $period->id,
                    'code' => $c['code'],
                ],
                $c
            );
        }
    }
}
