<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_STUDENT = 'student';

    public const ROLE_CHEIKH = 'cheikh';

    public const ROLE_ASSISTANT = 'assistant';

    public const ROLE_ADMIN = 'admin';

    public const ROLE_OPTIONS = [
        self::ROLE_STUDENT => 'Étudiant — Compte standard par défaut; cours, progression et téléchargements',
        self::ROLE_CHEIKH => 'Cheikh — Enseignant rattaché à une mahdara; cours, statistiques et questions',
        self::ROLE_ASSISTANT => 'Assistant — Aide technique; upload et organisation des cours au nom du cheikh',
        self::ROLE_ADMIN => 'Administrateur — Équipe du projet; gestion complète via le panel web',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'prenom',
        'email',
        'telephone',
        'role',
        'assistant_cheikh_id',
        'status',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'admin'
            && $this->role === 'admin'
            && $this->status === 'active';
    }

    public function cheikh()
    {
        return $this->hasOne(Cheikh::class);
    }

    public function assistantCheikh()
    {
        return $this->belongsTo(Cheikh::class, 'assistant_cheikh_id');
    }
}
