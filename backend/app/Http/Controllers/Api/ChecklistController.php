<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\ChecklistItem;
use App\Models\Department;
use App\Models\DocumentFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    /**
     * Get all 30 checklist items with document status for the department and period.
     */
    public function index(Request $request): JsonResponse
    {
        $period = AcademicPeriod::where('is_active', true)->first() ?: AcademicPeriod::first();
        $department = Department::where('code', $request->query('department', 'TIND'))->first() ?: Department::first();

        $items = ChecklistItem::orderBy('sort_order')->get();

        $documentFiles = DocumentFile::with(['versions', 'latestVerification'])
            ->where('academic_period_id', $period->id)
            ->where('department_id', $department->id)
            ->whereNull('course_id')
            ->get()
            ->keyBy('checklist_item_id');

        $result = $items->map(function ($item) use ($documentFiles) {
            $doc = $documentFiles->get($item->id);

            return [
                'id' => $item->id,
                'item_no' => $item->item_no,
                'code' => $item->code,
                'root_folder' => $item->root_folder,
                'subfolder' => $item->subfolder,
                'document_name' => $item->document_name,
                'iso_clause' => $item->iso_clause,
                'executor' => $item->executor,
                'level' => $item->level,
                'instructions' => $item->instructions,
                'is_per_course' => $item->is_per_course,
                'status' => $doc ? $doc->status : 'missing',
                'document' => $doc ? [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'file_name' => $doc->file_name,
                    'original_name' => $doc->original_name,
                    'file_size' => $doc->file_size,
                    'current_version' => $doc->current_version,
                    'mime_type' => $doc->mime_type,
                    'is_digitally_signed' => $doc->is_digitally_signed,
                    'uploaded_by' => $doc->uploaded_by,
                    'updated_at' => $doc->updated_at->toISOString(),
                    'verification' => $doc->latestVerification,
                ] : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'period' => $period,
                'department' => $department,
                'items' => $result,
            ],
        ]);
    }

    /**
     * Mark an item status (e.g. not_applicable).
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:missing,draft,submitted,verified,rejected,not_applicable',
            'notes' => 'nullable|string',
            'course_id' => 'nullable|exists:courses,id',
        ]);

        $item = ChecklistItem::findOrFail($id);
        $period = AcademicPeriod::where('is_active', true)->first();
        $department = Department::first();

        $query = DocumentFile::where('checklist_item_id', $item->id)
            ->where('academic_period_id', $period->id)
            ->where('department_id', $department->id);

        if (!empty($validated['course_id'])) {
            $query->where('course_id', $validated['course_id']);
        } else {
            $query->whereNull('course_id');
        }

        $document = $query->first();

        if (!$document) {
            $document = DocumentFile::create([
                'checklist_item_id' => $item->id,
                'course_id' => $validated['course_id'] ?? null,
                'department_id' => $department->id,
                'academic_period_id' => $period->id,
                'title' => $item->document_name,
                'file_name' => '',
                'original_name' => '',
                'storage_path' => '',
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]);
        } else {
            $document->update([
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? $document->notes,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $document,
        ]);
    }
}
