<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\AuditComment;
use App\Models\AuditVerification;
use App\Models\Department;
use App\Models\DocumentFile;
use App\Models\DocumentVersion;
use App\Services\AuditReadinessCalculator;
use App\Services\FolderScaffoldService;
use Database\Seeders\AcademicAndDepartmentSeeder;
use Database\Seeders\ChecklistPoin7Seeder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request, AuditReadinessCalculator $calculator): JsonResponse
    {
        $period = AcademicPeriod::where('is_active', true)->first() ?: AcademicPeriod::first();
        $department = Department::where('code', $request->query('department', 'TIF'))->first() ?: Department::first();

        if (!$period || !$department) {
            return response()->json([
                'status' => 'error',
                'message' => 'Academic period or department not found. Please run seeders.',
            ], 404);
        }

        $readiness = $calculator->calculate($period, $department);

        // Recent audit activities filtered by department
        $recentVerifications = AuditVerification::with(['documentFile.checklistItem', 'documentFile.course'])
            ->whereHas('documentFile', fn ($q) => $q->where('department_id', $department->id))
            ->latest('verified_at')
            ->take(6)
            ->get();

        $recentComments = AuditComment::with(['documentFile.checklistItem', 'documentFile.course'])
            ->whereHas('documentFile', fn ($q) => $q->where('department_id', $department->id))
            ->latest()
            ->take(6)
            ->get();

        $activeNCRs = AuditVerification::with(['documentFile.checklistItem', 'documentFile.course'])
            ->whereHas('documentFile', fn ($q) => $q->where('department_id', $department->id))
            ->whereIn('audit_status', ['major_ncr', 'minor_observation'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'readiness' => $readiness,
                'active_ncrs' => $activeNCRs,
                'recent_verifications' => $recentVerifications,
                'recent_comments' => $recentComments,
                'period' => $period,
                'department' => $department,
            ],
        ]);
    }

    /**
     * Reset database demo records to standard ISO 21001 initial state.
     */
    public function resetDemo(Request $request, FolderScaffoldService $scaffolder, AuditReadinessCalculator $calculator): JsonResponse
    {
        $deptCode = $request->query('department');
        $period = AcademicPeriod::where('is_active', true)->first() ?: AcademicPeriod::first();

        // Ensure base seeders run
        (new AcademicAndDepartmentSeeder())->run();
        (new ChecklistPoin7Seeder())->run();

        $seeder = new DatabaseSeeder();

        $departments = $deptCode && $deptCode !== 'all'
            ? Department::where('code', $deptCode)->get()
            : Department::all();

        foreach ($departments as $dept) {
            // Delete existing documents for this dept to start fresh
            $docs = DocumentFile::where('academic_period_id', $period->id)->where('department_id', $dept->id)->get();
            foreach ($docs as $d) {
                AuditVerification::where('document_file_id', $d->id)->delete();
                AuditComment::where('document_file_id', $d->id)->delete();
                DocumentVersion::where('document_file_id', $d->id)->delete();
                $d->delete();
            }

            // Scaffold folders
            $scaffolder->scaffold($period, $dept);

            // Re-seed sample documents
            $seeder->seedSampleDocuments($period, $dept);
        }

        $activeDept = Department::where('code', $deptCode ?: 'TIF')->first() ?: Department::first();
        $readiness = $calculator->calculate($period, $activeDept);

        return response()->json([
            'status' => 'success',
            'message' => 'Data kesiapan ISO 21001 berhasil di-reset ke standar awal.',
            'data' => [
                'readiness' => $readiness,
                'department' => $activeDept,
            ],
        ]);
    }
}
