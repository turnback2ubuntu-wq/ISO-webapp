<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'faculty',
        'degree',
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
