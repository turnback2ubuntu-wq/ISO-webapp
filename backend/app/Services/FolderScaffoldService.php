<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentFolder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FolderScaffoldService
{
    /**
     * Scaffold standard ISO 21001 folder tree for a department and academic period.
     */
    public function scaffold(AcademicPeriod $period, Department $department): array
    {
        $baseRelativePath = "documents/{$period->code}/{$department->code}";
        Storage::disk('public')->makeDirectory($baseRelativePath);

        $rootFolders = [
            '01_Kurikulum' => [
                'has_perangkat' => true,
            ],
            '02_Skripsi' => [
                'subfolders' => [
                    'a_SK-Pembimbing-dan-Penguji',
                    'b_Buku-Panduan-Skripsi',
                    'c_Bukti-Bimbingan',
                    'd_Bukti-Cek-Plagiasi',
                    'e_Kebijakan-Plagiasi',
                    'f_Penilaian-Sidang',
                    'g_Bukti-Persyaratan-Sidang',
                ],
            ],
            '03_Wisuda' => [
                'subfolders' => [
                    'a_Bukti-Persyaratan-Wisuda',
                    'b_Pelaporan-Kelulusan-PDDIKTI',
                    'c_Transkrip-dan-Ijazah',
                ],
            ],
            '04_Evaluasi-dan-Akreditasi' => [
                'subfolders' => [
                    'a_Sertifikat-Akreditasi-BAN-PT-LAM',
                    'b_Survei-Kepuasan-Interested-Parties',
                    'c_Tracer-Study',
                    'd_EDOM-Semester-Genap-Terakhir',
                    'e_Dokumen-Evaluasi-Diri',
                    'f_Laporan-Kinerja-Program-Studi',
                ],
            ],
            '05_Penelitian-dan-PkM' => [
                'subfolders' => [
                    'a_Blueprint-Penelitian-dan-PkM',
                    'b_Proposal-Hibah-Publikasi-dan-CekPlagiasi',
                ],
            ],
        ];

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

        $createdFolders = [];
        $courses = Course::where('department_id', $department->id)
            ->where('academic_period_id', $period->id)
            ->get();

        foreach ($rootFolders as $rootName => $config) {
            $rootPath = "{$baseRelativePath}/{$rootName}";
            Storage::disk('public')->makeDirectory($rootPath);

            $rootFolderModel = DocumentFolder::firstOrCreate(
                [
                    'academic_period_id' => $period->id,
                    'department_id' => $department->id,
                    'name' => $rootName,
                    'parent_id' => null,
                ],
                [
                    'slug' => Str::slug($rootName),
                    'path' => $rootPath,
                    'is_system' => true,
                ]
            );
            $createdFolders[] = $rootFolderModel;

            // Handle 01_Kurikulum Perangkat-Perkuliahan
            if (!empty($config['has_perangkat'])) {
                $perangkatParentPath = "{$rootPath}/Perangkat-Perkuliahan";
                Storage::disk('public')->makeDirectory($perangkatParentPath);

                $perangkatParentFolder = DocumentFolder::firstOrCreate(
                    [
                        'academic_period_id' => $period->id,
                        'department_id' => $department->id,
                        'parent_id' => $rootFolderModel->id,
                        'name' => 'Perangkat-Perkuliahan',
                    ],
                    [
                        'slug' => 'perangkat-perkuliahan',
                        'path' => $perangkatParentPath,
                        'is_system' => true,
                    ]
                );
                $createdFolders[] = $perangkatParentFolder;

                // Create folder per course
                foreach ($courses as $course) {
                    $courseSlug = Str::slug("{$course->code}_{$course->name}");
                    $courseFolderName = "{$course->code}_" . Str::limit(Str::slug($course->name), 40, '');
                    $coursePath = "{$perangkatParentPath}/{$courseFolderName}";
                    Storage::disk('public')->makeDirectory($coursePath);

                    $courseFolder = DocumentFolder::firstOrCreate(
                        [
                            'academic_period_id' => $period->id,
                            'department_id' => $department->id,
                            'parent_id' => $perangkatParentFolder->id,
                            'course_id' => $course->id,
                            'name' => "{$course->code} - {$course->name}",
                        ],
                        [
                            'slug' => $courseSlug,
                            'path' => $coursePath,
                            'is_system' => true,
                        ]
                    );
                    $createdFolders[] = $courseFolder;

                    // 9 subfolders per course
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

            // Handle normal subfolders for roots 02, 03, 04, 05
            if (!empty($config['subfolders'])) {
                foreach ($config['subfolders'] as $subName) {
                    $subPath = "{$rootPath}/{$subName}";
                    Storage::disk('public')->makeDirectory($subPath);

                    DocumentFolder::firstOrCreate(
                        [
                            'academic_period_id' => $period->id,
                            'department_id' => $department->id,
                            'parent_id' => $rootFolderModel->id,
                            'name' => $subName,
                        ],
                        [
                            'slug' => Str::slug($subName),
                            'path' => $subPath,
                            'is_system' => true,
                        ]
                    );
                }
            }
        }

        return $createdFolders;
    }
}
