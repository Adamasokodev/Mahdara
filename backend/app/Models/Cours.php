<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cours extends Model
{
    protected $fillable = [
        'titre',
        'matiere_id',
        'cheikh_id',
        'mahdara_id',
        'description',
        'type',
        'langue',
        'fichier_path',
        'duree_secondes',
        'taille_octets',
        'image_path',
        'statut',
        'nombre_ecoutes',
        'telechargements',
        'publie_le',
        'niveau',
        'livre',
        'contenu',
        'type_media',
        'extrait_url',
        'extrait_path',
    ];

    protected function casts(): array
    {
        return [
            'duree_secondes' => 'integer',
            'taille_octets' => 'integer',
            'nombre_ecoutes' => 'integer',
            'telechargements' => 'integer',
            'publie_le' => 'datetime',
        ];
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function cheikh()
    {
        return $this->belongsTo(Cheikh::class);
    }

    public function mahdara()
    {
        return $this->belongsTo(Mahdara::class);
    }

    public function progressions()
    {
        return $this->hasMany(Progression::class);
    }

    public function parties()
    {
        return $this->hasMany(PartieCours::class, 'cours_id')->orderBy('ordre')->orderBy('id');
    }
}
