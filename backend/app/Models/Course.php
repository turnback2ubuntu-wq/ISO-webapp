<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'academic_period_id',
        'code',
        'name',
        'credits',
        'semester',
        'lecturer_name',
        'has_practicum',
    ];

    protected $casts = [
        'has_practicum' => 'boolean',
        'credits' => 'integer',
        'semester' => 'integer',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
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
