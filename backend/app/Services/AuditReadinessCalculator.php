<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use App\Models\ChecklistItem;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentFile;

class AuditReadinessCalculator
{
    /**
     * Compute comprehensive ISO 21001 audit readiness score and statistics.
     */
    public function calculate(AcademicPeriod $period, Department $department): array
    {
        $checklistItems = ChecklistItem::orderBy('sort_order')->get();
        $courses = Course::where('department_id', $department->id)
            ->where('academic_period_id', $period->id)
            ->get();

        $rootFolders = [
            '01_Kurikulum' => 'Tata Kelola Kurikulum & Perangkat Pembelajaran',
            '02_Skripsi' => 'Tugas Akhir & Sidang Skripsi',
            '03_Wisuda' => 'Kelulusan, PDDIKTI & Ijazah',
            '04_Evaluasi-dan-Akreditasi' => 'Evaluasi Kinerja, EDOM & Akreditasi',
            '05_Penelitian-dan-PkM' => 'Riset, Publikasi & Pengabdian Masyarakat',
        ];

        $rootStats = [];
        foreach ($rootFolders as $rf => $label) {
            $rootStats[$rf] = [
                'name' => $rf,
                'label' => $label,
                'total_expected' => 0,
                'verified' => 0,
                'submitted' => 0,
                'draft' => 0,
                'missing' => 0,
                'not_applicable' => 0,
                'rejected' => 0,
                'score_percent' => 0,
            ];
        }

        $allDocs = DocumentFile::where('academic_period_id', $period->id)
            ->where('department_id', $department->id)
            ->get();

        // Calculate expected items
        foreach ($checklistItems as $item) {
            $rf = $item->root_folder;
            if (!isset($rootStats[$rf])) {
                continue;
            }

            if ($item->is_per_course) {
                // Multiplied by number of courses
                $countCourses = max(1, $courses->count());
                $rootStats[$rf]['total_expected'] += $countCourses;

                foreach ($courses as $course) {
                    $doc = $allDocs->first(fn ($d) => $d->checklist_item_id == $item->id && $d->course_id == $course->id);
                    if (!$doc) {
                        $rootStats[$rf]['missing']++;
                    } else {
                        $this->incrementStatus($rootStats[$rf], $doc->status);
                    }
                }
            } else {
                $rootStats[$rf]['total_expected'] += 1;
                $doc = $allDocs->first(fn ($d) => $d->checklist_item_id == $item->id && is_null($d->course_id));
                if (!$doc) {
                    $rootStats[$rf]['missing']++;
                } else {
                    $this->incrementStatus($rootStats[$rf], $doc->status);
                }
            }
        }

        $overallTotalExpected = 0;
        $overallFulfilled = 0; // verified + not_applicable + (submitted * 0.5)
        $overallVerified = 0;
        $overallSubmitted = 0;
        $overallMissing = 0;
        $overallRejected = 0;
        $overallNotApplicable = 0;

        foreach ($rootStats as $rf => &$stat) {
            $denom = max(1, $stat['total_expected']);
            // Compliant calculation: verified + not_applicable + submitted*0.5
            $fulfilled = $stat['verified'] + $stat['not_applicable'] + ($stat['submitted'] * 0.5);
            $stat['score_percent'] = min(100, (int) round(($fulfilled / $denom) * 100));

            $overallTotalExpected += $stat['total_expected'];
            $overallFulfilled += $fulfilled;
            $overallVerified += $stat['verified'];
            $overallSubmitted += $stat['submitted'];
            $overallMissing += $stat['missing'];
            $overallRejected += $stat['rejected'];
            $overallNotApplicable += $stat['not_applicable'];
        }

        $overallDenominator = max(1, $overallTotalExpected);
        $overallScorePercent = min(100, (int) round(($overallFulfilled / $overallDenominator) * 100));

        // Days remaining countdown until audit
        $daysRemaining = 14;
        if ($period->audit_target_date) {
            $target = \Carbon\Carbon::parse($period->audit_target_date);
            $daysRemaining = max(0, (int) now()->diffInDays($target, false));
        }

        return [
            'overall_score_percent' => $overallScorePercent,
            'days_remaining' => $daysRemaining,
            'audit_target_date' => $period->audit_target_date?->format('Y-m-d') ?? '2026-04-06',
            'period' => [
                'id' => $period->id,
                'code' => $period->code,
                'name' => $period->name,
            ],
            'department' => [
                'id' => $department->id,
                'code' => $department->code,
                'name' => $department->name,
                'faculty' => $department->faculty,
            ],
            'counts' => [
                'total_expected' => $overallTotalExpected,
                'verified' => $overallVerified,
                'submitted' => $overallSubmitted,
                'missing' => $overallMissing,
                'rejected' => $overallRejected,
                'not_applicable' => $overallNotApplicable,
            ],
            'root_folder_breakdown' => array_values($rootStats),
        ];
    }

    private function incrementStatus(array &$stat, string $status): void
    {
        switch ($status) {
            case 'verified':
                $stat['verified']++;
                break;
            case 'submitted':
                $stat['submitted']++;
                break;
            case 'draft':
                $stat['draft']++;
                break;
            case 'not_applicable':
                $stat['not_applicable']++;
                break;
            case 'needs_revision':
            case 'rejected':
                $stat['rejected']++;
                break;
            case 'missing':
            default:
                $stat['missing']++;
                break;
        }
    }
}
