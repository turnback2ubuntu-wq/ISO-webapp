<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditComment;
use App\Models\AuditVerification;
use App\Models\DocumentFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditVerificationController extends Controller
{
    /**
     * Submit an audit verification result (Compliant, Minor Observation, Major NCR).
     */
    public function verify(Request $request, int $documentId): JsonResponse
    {
        $validated = $request->validate([
            'auditor_name' => 'required|string|max:150',
            'audit_status' => 'required|in:compliant,minor_observation,major_ncr,pending',
            'iso_clause_ref' => 'nullable|string|max:100',
            'finding_notes' => 'nullable|string',
            'corrective_action_plan' => 'nullable|string',
            'deadline' => 'nullable|date',
        ]);

        $document = DocumentFile::with('checklistItem')->findOrFail($documentId);

        $verification = AuditVerification::create([
            'document_file_id' => $document->id,
            'auditor_name' => $validated['auditor_name'],
            'audit_status' => $validated['audit_status'],
            'iso_clause_ref' => $validated['iso_clause_ref'] ?? $document->checklistItem->iso_clause,
            'finding_notes' => $validated['finding_notes'] ?? null,
            'corrective_action_plan' => $validated['corrective_action_plan'] ?? null,
            'deadline' => $validated['deadline'] ?? null,
            'verified_at' => now(),
        ]);

        // Synchronize document file status
        if ($validated['audit_status'] === 'compliant') {
            $document->update(['status' => 'verified']);
        } elseif (in_array($validated['audit_status'], ['minor_observation', 'major_ncr'])) {
            $document->update(['status' => 'rejected']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Status verifikasi audit berhasil disimpan.',
            'data' => $verification,
        ]);
    }

    /**
     * Add a dialogue comment to a document.
     */
    public function addComment(Request $request, int $documentId): JsonResponse
    {
        $validated = $request->validate([
            'sender_name' => 'required|string|max:150',
            'sender_role' => 'required|string|max:50',
            'message' => 'required|string',
        ]);

        $document = DocumentFile::findOrFail($documentId);

        $comment = AuditComment::create([
            'document_file_id' => $document->id,
            'sender_name' => $validated['sender_name'],
            'sender_role' => $validated['sender_role'],
            'message' => $validated['message'],
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $comment,
        ]);
    }

    /**
     * List all active audit findings across the program study.
     */
    public function findings(): JsonResponse
    {
        $findings = AuditVerification::with(['documentFile.checklistItem', 'documentFile.course'])
            ->whereIn('audit_status', ['minor_observation', 'major_ncr'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $findings,
        ]);
    }
}
