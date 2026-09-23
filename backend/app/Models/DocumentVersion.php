<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_file_id',
        'version_number',
        'storage_path',
        'original_name',
        'file_size',
        'file_hash',
        'changelog',
        'uploaded_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function documentFile(): BelongsTo
    {
        return $this->belongsTo(DocumentFile::class);
    }
}
