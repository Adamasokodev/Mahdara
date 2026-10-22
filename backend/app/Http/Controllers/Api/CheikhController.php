<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cheikh;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CheikhController extends Controller
{
    public function index()
    {
        $cheikhs = Cheikh::query()
            ->whereHas('user', fn ($query) => $query->where('status', 'active'))
            ->with([
                'user:id,name,prenom',
                'mahdara:id,nom,wilaya',
                'matieres' => fn ($query) => $query->whereIn('actif', ['true', '1'])
                    ->select('matieres.id', 'nom', 'slug', 'icone'),
            ])
            ->withCount('cours')
            ->orderBy('id')
            ->get();

        return response()->json($cheikhs);
    }

    public function show(Cheikh $cheikh)
    {
        abort_unless($cheikh->user?->status === 'active', 404);

        return response()->json($cheikh->load([
            'user:id,name,prenom',
            'mahdara:id,nom,wilaya,localisation',
            'matieres' => fn ($query) => $query->whereIn('actif', ['true', '1'])
                ->select('matieres.id', 'nom', 'slug', 'description', 'icone'),
        ])->loadCount('cours'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->cheikhRules());

        $cheikh = Cheikh::create(collect($validated)->except('matiere_ids')->all());
        if (array_key_exists('matiere_ids', $validated)) {
            $cheikh->matieres()->sync($validated['matiere_ids']);
        }

        return response()->json([
            'message' => 'Cheikh ajouté avec succès.',
            'cheikh' => $cheikh->load(['user:id,name,prenom', 'mahdara', 'matieres']),
        ], 201);
    }

    public function update(Request $request, Cheikh $cheikh)
    {
        $validated = $request->validate($this->cheikhRules($cheikh, partial: true));
        $cheikh->update(collect($validated)->except('matiere_ids')->all());

        if (array_key_exists('matiere_ids', $validated)) {
            $cheikh->matieres()->sync($validated['matiere_ids']);
        }

        return response()->json([
            'message' => 'Cheikh mis à jour avec succès.',
            'cheikh' => $cheikh->refresh()->load(['user:id,name,prenom', 'mahdara', 'matieres']),
        ]);
    }

    public function destroy(Cheikh $cheikh)
    {
        $cheikh->delete();

        return response()->json(['message' => 'Cheikh supprimé avec succès.']);
    }

    private function cheikhRules(?Cheikh $cheikh = null, bool $partial = false): array
    {
        $prefix = $partial ? 'sometimes|' : '';

        return [
            'user_id' => [
                $prefix.'required',
                'integer',
                Rule::exists('users', 'id')->where('role', User::ROLE_CHEIKH),
                Rule::unique('cheikhs', 'user_id')->ignore($cheikh?->id),
            ],
            'mahdara_id' => [$prefix.'required', 'integer', 'exists:mahdaras,id'],
            'photo_path' => $prefix.'nullable|string|max:2048',
            'bio' => $prefix.'nullable|string|max:10000',
            'verifier' => $prefix.'sometimes|boolean',
            'matiere_ids' => $prefix.'sometimes|array',
            'matiere_ids.*' => 'integer|distinct|exists:matieres,id',
        ];
    }
}
