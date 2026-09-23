<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'is_active',
        'audit_target_date',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'audit_target_date' => 'date',
    ];

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function documentFiles(): HasMany
    {
        return $this->hasMany(DocumentFile::class);
    }

    public function folders(): HasMany
    {
        return $this->hasMany(DocumentFolder::class);
    }
}
