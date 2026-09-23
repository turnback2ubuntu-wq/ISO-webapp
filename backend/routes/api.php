<?php

use App\Http\Controllers\Api\AuditVerificationController;
use App\Http\Controllers\Api\ChecklistController;
use App\Http\Controllers\Api\CoursePerangkatController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentFileController;
use App\Http\Controllers\Api\ExportZipController;
use App\Http\Controllers\Api\FolderController;
use App\Http\Controllers\Api\GoogleDriveImportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // 1. Dashboard & Audit Readiness Metrics
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // 2. Checklist Poin 7 FT (30 Items)
    Route::get('/checklist', [ChecklistController::class, 'index']);
    Route::post('/checklist/{id}/status', [ChecklistController::class, 'updateStatus']);

    // 3. Course Perangkat Perkuliahan (9 items per course) & Course CRUD
    Route::get('/courses/perangkat-matrix', [CoursePerangkatController::class, 'index']);
    Route::post('/courses', [CoursePerangkatController::class, 'store']);
    Route::get('/courses/{id}', [CoursePerangkatController::class, 'show']);
    Route::put('/courses/{id}', [CoursePerangkatController::class, 'update']);
    Route::delete('/courses/{id}', [CoursePerangkatController::class, 'destroy']);
    Route::post('/courses/{id}/toggle-practicum', [CoursePerangkatController::class, 'togglePracticum']);

    // 4. File Management & Folder Hierarchy
    Route::get('/folders/tree', [FolderController::class, 'tree']);
    Route::post('/folders/scaffold', [FolderController::class, 'scaffold']);

    // 5. Document Upload, Versioning, Inspection & Download
    Route::post('/documents/upload', [DocumentFileController::class, 'upload']);
    Route::get('/documents/{id}', [DocumentFileController::class, 'show']);
    Route::get('/documents/{id}/download', [DocumentFileController::class, 'download']);
    Route::delete('/documents/{id}', [DocumentFileController::class, 'destroy']);

    // 6. Google Drive Link Integration & Bulk Importer
    Route::post('/documents/upload-drive-link', [GoogleDriveImportController::class, 'uploadDriveLink']);
    Route::post('/documents/parse-spreadsheet', [GoogleDriveImportController::class, 'parseSpreadsheet']);
    Route::post('/documents/bulk-import-drive', [GoogleDriveImportController::class, 'bulkImport']);
    Route::post('/documents/sync-git-repo', [GoogleDriveImportController::class, 'syncGitRepo']);

    // 7. Audit Verification & Multi-Party Dialogue
    Route::post('/documents/{id}/verify', [AuditVerificationController::class, 'verify']);
    Route::post('/documents/{id}/comments', [AuditVerificationController::class, 'addComment']);
    Route::get('/audit/findings', [AuditVerificationController::class, 'findings']);

    // 8. Bulk Hierarchical ZIP Export
    Route::get('/export/zip', [ExportZipController::class, 'downloadZip']);
});
