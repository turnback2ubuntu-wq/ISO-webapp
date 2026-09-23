<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\AuditComment;
use App\Models\AuditVerification;
use App\Models\Department;
use App\Models\DocumentFile;
use App\Services\AuditReadinessCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request, AuditReadinessCalculator $calculator): JsonResponse
    {
        $period = AcademicPeriod::where('is_active', true)->first() ?: AcademicPeriod::first();
        $department = Department::where('code', $request->query('department', 'TIND'))->first() ?: Department::first();

        if (!$period || !$department) {
            return response()->json([
                'status' => 'error',
                'message' => 'Academic period or department not found. Please run seeders.',
            ], 404);
        }

        $readiness = $calculator->calculate($period, $department);

        // Recent audit activities
        $recentVerifications = AuditVerification::with(['documentFile.checklistItem'])
            ->latest()
            ->take(5)
            ->get();

        $recentComments = AuditComment::with(['documentFile.checklistItem'])
            ->latest()
            ->take(5)
            ->get();

        $activeNCRs = AuditVerification::with(['documentFile.checklistItem', 'documentFile.course'])
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
            ],
        ]);
    }
}
