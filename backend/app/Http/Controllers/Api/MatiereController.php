<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Matiere;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class MatiereController extends Controller
{
    public function index()
    {
        $query = Matiere::query()
            ->withCount(['cours', 'cheikhs'])
            ->orderBy('ordre')
            ->orderBy('nom');
        $user = Auth::guard('sanctum')->user();
        if ($user?->role !== User::ROLE_ADMIN || $user->status !== 'active') {
            $query->whereIn('actif', ['true', '1']);
        }

        return response()->json($query->get());
    }

    public function show(Matiere $matiere)
    {
        $user = Auth::guard('sanctum')->user();
        abort_unless(
            ($user?->role === User::ROLE_ADMIN && $user->status === 'active') || (bool) $matiere->actif,
            404,
        );

        return response()->json($matiere->load([
            'cheikhs' => fn ($query) => $query->whereHas(
                'user',
                fn ($users) => $users->where('status', 'active'),
            )->with('user:id,name,prenom'),
        ])->loadCount('cours'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->matiereRules());
        $matiere = Matiere::create($validated);

        return response()->json([
            'message' => 'Matière ajoutée avec succès.',
            'matiere' => $matiere,
        ], 201);
    }

    public function update(Request $request, Matiere $matiere)
    {
        $matiere->update($request->validate($this->matiereRules($matiere, partial: true)));

        return response()->json([
            'message' => 'Matière mise à jour avec succès.',
            'matiere' => $matiere->refresh(),
        ]);
    }

    public function destroy(Matiere $matiere)
    {
        if ($matiere->cours()->exists() || $matiere->cheikhs()->exists()) {
            return response()->json([
                'message' => 'Cette matière est utilisée par des cours ou des cheikhs. Désactivez-la au lieu de la supprimer.',
            ], 409);
        }

        $matiere->delete();

        return response()->json(['message' => 'Matière supprimée avec succès.']);
    }

    private function matiereRules(?Matiere $matiere = null, bool $partial = false): array
    {
        $prefix = $partial ? 'sometimes|' : '';

        return [
            'nom' => $prefix.'required|string|max:255',
            'slug' => [
                $prefix.'required',
                'string',
                'max:255',
                Rule::unique('matieres', 'slug')->ignore($matiere?->id),
            ],
            'description' => $prefix.'nullable|string|max:10000',
            'icone' => $prefix.'nullable|string|max:255',
            'ordre' => $prefix.'sometimes|integer|min:0',
            'actif' => $prefix.'sometimes|boolean',
        ];
    }
}
