<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cheikh extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'mahdara_id',
        'photo_path',
        'bio',
        'verifier',
    ];

    protected function casts(): array
    {
        return [
            'verifier' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mahdara()
    {
        return $this->belongsTo(Mahdara::class);
    }

    public function cours()
    {
        return $this->hasMany(Cours::class);
    }

    public function matieres()
    {
        return $this->belongsToMany(Matiere::class)->withTimestamps();
    }
}
