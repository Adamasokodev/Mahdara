<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mahdara extends Model
{
    protected $fillable = ['nom', 'wilaya', 'localisation', 'description'];
    public function cheikhs()
    {
        return $this->hasMany(Cheikh::class);
    }

    public function cours()
    {
        return $this->hasMany(Cours::class);
    }
}
