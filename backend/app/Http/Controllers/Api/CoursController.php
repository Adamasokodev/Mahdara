<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cheikh;
use App\Models\Cours;
use App\Models\Matiere;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CoursController extends Controller
{
    public function index()
    {
        $user = Auth::guard('sanctum')->user();
        $query = Cours::query()
            ->with([
                'matiere:id,nom,slug,icone',
                'cheikh.user:id,name,prenom',
                'mahdara:id,nom,wilaya',
            ])
            ->orderBy('id');

        if (in_array($user?->role, [User::ROLE_CHEIKH, User::ROLE_ASSISTANT], true)) {
            $cheikh = $user->status === 'active'
                ? ($user->role === User::ROLE_CHEIKH ? $user->cheikh : $user->assistantCheikh)
                : null;

            if ($cheikh) {
                $query->where('cheikh_id', $cheikh->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        } elseif ($user?->role !== User::ROLE_ADMIN || $user->status !== 'active') {
            $query->where('statut', 'publie')
                ->whereNotNull('publie_le')
                ->where('publie_le', '<=', now());
        }

        return response()->json($query->get()->map(
            fn (Cours $cours): array => $this->courseData($cours, $user)
        ));
    }

    public function show(Cours $cours)
    {
        $user = Auth::guard('sanctum')->user();
        $this->authorizeCourseVisibility($user, $cours);

        return response()->json($this->courseData(
            $cours->load(['matiere', 'cheikh.user:id,name,prenom', 'mahdara:id,nom,wilaya']),
            $user,
        ));
    }

    public function store(Request $request)
    {
        $cheikh = $this->managedCheikh($request->user());
        $this->mapLegacyFields($request);
        $validated = $request->validate($this->courseRules());
        $this->validateCourseAssignment($cheikh, $validated);

        $course = Cours::create([
            ...$validated,
            'cheikh_id' => $cheikh->id,
            'mahdara_id' => $cheikh->mahdara_id,
            'statut' => $validated['statut'] ?? 'brouillon',
            'publie_le' => ($validated['statut'] ?? 'brouillon') === 'publie' ? now() : null,
        ]);

        return response()->json([
            'message' => 'Cours ajouté avec succès.',
            'cours' => $this->courseData(
                $course->load(['matiere', 'cheikh.user:id,name,prenom', 'mahdara:id,nom,wilaya']),
                $request->user(),
            ),
        ], 201);
    }

    public function uploadAudio(Request $request)
    {
        $this->managedCheikh($request->user());
        $validated = $request->validate([
            'audio' => 'required|file|mimetypes:audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/webm,audio/ogg,audio/wav|max:102400',
        ]);

        $path = $validated['audio']->store('cours/audio', 'public');

        return response()->json(['path' => $path, 'url' => Storage::disk('public')->url($path)], 201);
    }

    public function update(Request $request, Cours $cours)
    {
        $cheikh = $this->authorizeCourseManagement($request->user(), $cours);
        $this->mapLegacyFields($request);
        $validated = $request->validate($this->courseRules(partial: true));
        $this->validateCourseAssignment($cheikh, $validated);

        $cours->fill($validated);
        if (array_key_exists('statut', $validated)) {
            $cours->publie_le = $validated['statut'] === 'publie'
                ? ($cours->publie_le ?? now())
                : null;
        }
        $cours->save();

        return response()->json([
            'message' => 'Cours mis à jour avec succès.',
            'cours' => $this->courseData(
                $cours->refresh()->load(['matiere', 'cheikh.user:id,name,prenom', 'mahdara:id,nom,wilaya']),
                $request->user(),
            ),
        ]);
    }

    public function destroy(Request $request, Cours $cours)
    {
        $this->authorizeCourseManagement($request->user(), $cours);
        $cours->delete();

        return response()->json(['message' => 'Cours supprimé avec succès.']);
    }

    private function courseRules(bool $partial = false): array
    {
        $prefix = $partial ? 'sometimes|' : '';

        return [
            'titre' => $prefix.'required|string|max:150',
            'matiere_id' => [$prefix.'required', 'integer', 'exists:matieres,id'],
            'mahdara_id' => [$prefix.'sometimes', 'integer', 'exists:mahdaras,id'],
            'niveau' => $prefix.'required|string|max:100',
            'fichier_path' => $prefix.'required|string|max:2048',
            'description' => $prefix.'nullable|string|max:50000',
            'type' => [$prefix.'required', Rule::in(['audio', 'video'])],
            'langue' => $prefix.'required|string|max:10',
            'duree_secondes' => $prefix.'nullable|integer|min:1',
            'taille_octets' => $prefix.'nullable|integer|min:0',
            'image_path' => $prefix.'nullable|string|max:2048',
            'extrait_path' => $prefix.'nullable|string|max:2048',
            'statut' => [$prefix.'sometimes', Rule::in(['brouillon', 'publie'])],
            'livre' => $prefix.'nullable|string|max:150',
            'extrait_url' => $prefix.'nullable|url|max:2048',
        ];
    }

    private function mapLegacyFields(Request $request): void
    {
        $legacyMap = [
            'fichier_url' => 'fichier_path',
            'contenu' => 'description',
            'type_media' => 'type',
        ];

        foreach ($legacyMap as $legacy => $current) {
            if (! $request->exists($current) && $request->exists($legacy)) {
                $request->merge([$current => $request->input($legacy)]);
            }
        }

        if (! $request->exists('duree_secondes') && $request->filled('duree_minutes')) {
            $request->merge(['duree_secondes' => (int) $request->input('duree_minutes') * 60]);
        }

        if (! $request->exists('matiere_id') && $request->filled('matiere')) {
            $matiere = Matiere::query()
                ->where('slug', $request->input('matiere'))
                ->orWhere('nom', $request->input('matiere'))
                ->first();

            if ($matiere) {
                $request->merge(['matiere_id' => $matiere->id]);
            }
        }
    }

    private function validateCourseAssignment(Cheikh $cheikh, array $validated): void
    {
        if (isset($validated['matiere_id'])) {
            $matiere = Matiere::query()
                ->whereKey($validated['matiere_id'])
                ->whereIn('actif', ['true', '1'])
                ->first();
            abort_unless($matiere, 422, 'La matière sélectionnée est inactive ou inexistante.');
            abort_unless(
                $cheikh->matieres()->whereKey($matiere->id)->exists(),
                422,
                'Cette matière n’est pas associée au cheikh.',
            );
        }

        if (isset($validated['mahdara_id'])) {
            abort_unless(
                (int) $validated['mahdara_id'] === (int) $cheikh->mahdara_id,
                422,
                'La mahdara du cours doit correspondre à celle du cheikh.',
            );
        }
    }

    private function managedCheikh(User $user): Cheikh
    {
        abort_unless($user->status === 'active', 403, 'Seuls les comptes actifs peuvent gérer les cours.');

        $cheikh = match ($user->role) {
            User::ROLE_CHEIKH => $user->cheikh,
            User::ROLE_ASSISTANT => $user->assistantCheikh,
            default => null,
        };

        abort_unless($cheikh, 403, 'Aucun cheikh référent n’est associé à ce compte.');

        return $cheikh;
    }

    private function authorizeCourseManagement(User $user, Cours $cours): Cheikh
    {
        $cheikh = $this->managedCheikh($user);
        abort_unless($cours->cheikh_id === $cheikh->id, 403, 'Ce cours ne dépend pas de votre cheikh référent.');

        return $cheikh;
    }

    private function authorizeCourseVisibility(?User $user, Cours $cours): void
    {
        if ($user?->role === User::ROLE_ADMIN && $user->status === 'active') {
            return;
        }

        if (in_array($user?->role, [User::ROLE_CHEIKH, User::ROLE_ASSISTANT], true)) {
            $cheikh = $user->status === 'active'
                ? ($user->role === User::ROLE_CHEIKH ? $user->cheikh : $user->assistantCheikh)
                : null;
            abort_unless($cheikh && $cours->cheikh_id === $cheikh->id, 404);

            return;
        }

        abort_unless(
            $cours->statut === 'publie' && $cours->publie_le && $cours->publie_le->isPast(),
            404,
        );
    }

    private function courseData(Cours $cours, ?User $user): array
    {
        $hasContentAccess = ($cours->statut === 'publie' && $cours->publie_le && $cours->publie_le->isPast()) || ($user
            && in_array($user->role, [
                User::ROLE_STUDENT,
                User::ROLE_ADMIN,
                User::ROLE_CHEIKH,
                User::ROLE_ASSISTANT,
            ], true)
            && $user->status === 'active');
        $filePath = $cours->fichier_path;
        $fileUrl = $filePath && Str::startsWith($filePath, ['http://', 'https://'])
            ? $filePath
            : ($filePath ? Storage::disk('public')->url($filePath) : null);
        $excerptUrl = $cours->extrait_path
            ? Storage::disk('public')->url($cours->extrait_path)
            : $cours->extrait_url;

        return [
            'id' => $cours->id,
            'titre' => $cours->titre,
            'matiere_id' => $cours->matiere_id,
            'matiere' => $cours->matiere?->nom,
            'matiere_detail' => $cours->matiere,
            'cheikh_id' => $cours->cheikh_id,
            'cheikh' => $cours->cheikh,
            'mahdara_id' => $cours->mahdara_id,
            'mahdara' => $cours->mahdara,
            'niveau' => $cours->niveau,
            'description' => $hasContentAccess ? $cours->description : null,
            'fichier_path' => $hasContentAccess ? $cours->fichier_path : null,
            'fichier_url' => $hasContentAccess ? $fileUrl : null,
            'type' => $cours->type,
            'langue' => $cours->langue,
            'duree_secondes' => $cours->duree_secondes,
            'taille_octets' => $cours->taille_octets,
            'image_path' => $cours->image_path,
            'image_url' => $cours->image_path ? Storage::disk('public')->url($cours->image_path) : null,
            'statut' => $cours->statut,
            'nombre_ecoutes' => $cours->nombre_ecoutes,
            'telechargements' => $cours->telechargements,
            'publie_le' => $cours->publie_le,
            'livre' => $cours->livre,
            'contenu' => $hasContentAccess ? ($cours->contenu ?? $cours->description) : null,
            'type_media' => $cours->type_media ?? $cours->type,
            'extrait_path' => $cours->extrait_path,
            'extrait_url' => $excerptUrl,
            'duree_minutes' => $cours->duree_minutes ?? ($cours->duree_secondes ? (int) ceil($cours->duree_secondes / 60) : null),
        ];
    }
}
