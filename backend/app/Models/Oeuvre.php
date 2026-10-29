<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Oeuvre extends Model
{
    protected $table = 'oeuvres';

    protected $fillable = [
        'titre',
        'type',
        'auteur',
        'langue',
        'confrerie',
        'description',
        'aide_pedagogique',
        'fichier_path',
        'source_url',
        'statut',
        'ordre',
    ];

    protected function casts(): array
    {
        return ['ordre' => 'integer'];
    }
}
