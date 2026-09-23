<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DocumentFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'checklist_item_id',
        'course_id',
        'department_id',
        'academic_period_id',
        'folder_id',
        'title',
        'file_name',
        'original_name',
        'storage_path',
        'drive_url',
        'source_type',
        'is_external_link',
        'sync_to_git',
        'last_synced_at',
        'mime_type',
        'file_size',
        'file_hash',
        'current_version',
        'status',
        'is_digitally_signed',
        'uploaded_by',
        'notes',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'is_digitally_signed' => 'boolean',
        'is_external_link' => 'boolean',
        'sync_to_git' => 'boolean',
        'last_synced_at' => 'datetime',
    ];

    protected $appends = [
        'drive_embed_url',
    ];

    /**
     * Generate an embeddable Google Drive preview URL if drive_url is set.
     */
    public function getDriveEmbedUrlAttribute(): ?string
    {
        if (!$this->drive_url) {
            return null;
        }

        // Match /file/d/{id}
        if (preg_match('/\/file\/d\/([a-zA-Z0-9_-]+)/', $this->drive_url, $m)) {
            return "https://drive.google.com/file/d/{$m[1]}/preview";
        }

        // Match id={id}
        if (preg_match('/[?&]id=([a-zA-Z0-9_-]+)/', $this->drive_url, $m)) {
            return "https://drive.google.com/file/d/{$m[1]}/preview";
        }

        // Match /document/d/{id} or /spreadsheets/d/{id}
        if (preg_match('/\/d\/([a-zA-Z0-9_-]+)/', $this->drive_url, $m)) {
            return "https://drive.google.com/file/d/{$m[1]}/preview";
        }

        return $this->drive_url;
    }

    public function checklistItem(): BelongsTo
    {
        return $this->belongsTo(ChecklistItem::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(DocumentFolder::class, 'folder_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class);
    }

    public function verifications(): HasMany
    {
        return $this->hasMany(AuditVerification::class);
    }

    public function latestVerification(): HasOne
    {
        return $this->hasOne(AuditVerification::class)->latestOfMany();
    }

    public function comments(): HasMany
    {
        return $this->hasMany(AuditComment::class);
    }
}
