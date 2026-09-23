<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\Course;
use App\Models\Department;
use App\Models\DocumentFile;
use App\Models\DocumentFolder;
use App\Services\FolderScaffoldService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    /**
     * Get folder tree with document contents.
     */
    public function tree(Request $request): JsonResponse
    {
        $period = AcademicPeriod::where('is_active', true)->first() ?: AcademicPeriod::first();
        $department = Department::where('code', $request->query('department', 'TIF'))->first() ?: Department::first();

        // Ensure all courses in this department are synchronized to Perangkat-Perkuliahan
        $courseCount = Course::where('department_id', $department->id)
            ->where('academic_period_id', $period->id)
            ->count();

        $folderCourseCount = DocumentFolder::where('department_id', $department->id)
            ->where('academic_period_id', $period->id)
            ->whereNotNull('course_id')
            ->distinct('course_id')
            ->count('course_id');

        if ($folderCourseCount < $courseCount || DocumentFolder::where('department_id', $department->id)->count() === 0) {
            app(FolderScaffoldService::class)->scaffold($period, $department);
        }

        // Get top-level folders with nested children sorted by name
        $rootFolders = DocumentFolder::where('academic_period_id', $period->id)
            ->where('department_id', $department->id)
            ->whereNull('parent_id')
            ->orderBy('name')
            ->with([
                'children' => fn ($q) => $q->orderBy('name'),
                'children.children' => fn ($q) => $q->orderBy('name'),
                'children.children.children' => fn ($q) => $q->orderBy('name'),
            ])
            ->get();

        $documents = DocumentFile::with(['checklistItem', 'course', 'latestVerification'])
            ->where('academic_period_id', $period->id)
            ->where('department_id', $department->id)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'period' => $period,
                'department' => $department,
                'root_folders' => $rootFolders,
                'documents' => $documents,
            ],
        ]);
    }

    /**
     * Trigger scaffold service to ensure folder hierarchy exists.
     */
    public function scaffold(Request $request, FolderScaffoldService $scaffolder): JsonResponse
    {
        $period = AcademicPeriod::where('is_active', true)->first() ?: AcademicPeriod::first();
        $deptCode = $request->query('department');

        if ($deptCode && $deptCode !== 'all') {
            $department = Department::where('code', $deptCode)->first() ?: Department::first();
            $folders = $scaffolder->scaffold($period, $department);
            $count = count($folders);
        } else {
            $count = 0;
            foreach (Department::all() as $dept) {
                $folders = $scaffolder->scaffold($period, $dept);
                $count += count($folders);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pohon direktori ISO 21001 berhasil dibentuk dan disinkronkan.',
            'count' => $count,
        ]);
    }
}
