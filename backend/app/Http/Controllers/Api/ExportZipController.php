<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\Department;
use App\Services\ZipExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportZipController extends Controller
{
    /**
     * Generate and download ZIP bundle of audit documents.
     */
    public function downloadZip(Request $request, ZipExportService $zipService): BinaryFileResponse|JsonResponse
    {
        $period = AcademicPeriod::where('is_active', true)->first() ?: AcademicPeriod::first();
        $department = Department::where('code', $request->query('department', 'TIND'))->first() ?: Department::first();

        $rootFolder = $request->query('root_folder');
        $courseId = $request->query('course_id') ? (int) $request->query('course_id') : null;

        try {
            $zipPath = $zipService->exportZip($period, $department, $rootFolder, $courseId);

            if (!$zipPath || !file_exists($zipPath)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal membuat arsip berkas ZIP atau berkas fisik belum diunggah.',
                ], 400);
            }

            return response()->download($zipPath, basename($zipPath))->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
