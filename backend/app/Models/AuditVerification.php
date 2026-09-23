<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_file_id',
        'auditor_name',
        'audit_status',
        'iso_clause_ref',
        'finding_notes',
        'corrective_action_plan',
        'deadline',
        'verified_at',
    ];

    protected $casts = [
        'deadline' => 'date',
        'verified_at' => 'datetime',
    ];

    public function documentFile(): BelongsTo
    {
        return $this->belongsTo(DocumentFile::class);
    }
}
