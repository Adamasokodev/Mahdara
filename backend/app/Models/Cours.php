<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cours extends Model
{
    protected $fillable = [
        'titre',
        'matiere',
        'cheikh_id',
        'mahdara_id',
        'fichier_url',
        'duree_minutes',
        'niveau'
    ];

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
}
