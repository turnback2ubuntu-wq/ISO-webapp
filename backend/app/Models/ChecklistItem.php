<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChecklistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_no',
        'code',
        'root_folder',
        'subfolder',
        'document_name',
        'iso_clause',
        'executor',
        'level',
        'instructions',
        'is_per_course',
        'sort_order',
    ];

    protected $casts = [
        'item_no' => 'integer',
        'is_per_course' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function documentFiles(): HasMany
    {
        return $this->hasMany(DocumentFile::class);
    }
}
