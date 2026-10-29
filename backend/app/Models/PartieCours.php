<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartieCours extends Model
{
    protected $table = 'parties_cours';

    protected $fillable = [
        'cours_id',
        'titre',
        'contenu',
        'fichier_path',
        'source_url',
        'duree_secondes',
        'ordre',
    ];

    protected function casts(): array
    {
        return [
            'duree_secondes' => 'integer',
            'ordre' => 'integer',
        ];
    }

    public function cours()
    {
        return $this->belongsTo(Cours::class);
    }
}
