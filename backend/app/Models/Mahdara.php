<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mahdara extends Model
{
    use SoftDeletes;

    protected $fillable = ['nom', 'wilaya', 'localisation', 'description', 'actif'];

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
        ];
    }

    public function cheikhs()
    {
        return $this->hasMany(Cheikh::class);
    }

    public function cours()
    {
        return $this->hasMany(Cours::class);
    }
}
