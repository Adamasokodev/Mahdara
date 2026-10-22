<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Matiere extends Model
{
    protected $fillable = [
        'nom',
        'slug',
        'description',
        'icone',
        'ordre',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'ordre' => 'integer',
            'actif' => 'boolean',
        ];
    }

    public function cours()
    {
        return $this->hasMany(Cours::class);
    }

    public function cheikhs()
    {
        return $this->belongsToMany(Cheikh::class)->withTimestamps();
    }
}
