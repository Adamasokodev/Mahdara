<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cheikh extends Model
{
    protected $fillable = ['user_id', 'mahdara_id', 'specialite', 'bio'];

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
}
