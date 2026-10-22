<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mahdara;
use Illuminate\Http\Request;

class MahdaraController extends Controller
{
    public function index()
    {
        $mahadaras = Mahdara::query()
            ->where('actif', true)
            ->select('id', 'nom', 'wilaya', 'localisation', 'description', 'actif')
            ->withCount(['cheikhs', 'cours'])
            ->orderBy('nom')
            ->get();

        return response()->json($mahadaras);
    }

    public function show(Mahdara $mahdara)
    {
        abort_unless($mahdara->actif, 404);

        return response()->json($mahdara->load([
            'cheikhs' => fn ($query) => $query
                ->whereHas('user', fn ($users) => $users->where('status', 'active'))
                ->with([
                    'user:id,name,prenom',
                    'matieres' => fn ($matieres) => $matieres
                        ->whereIn('actif', ['true', '1'])
                        ->select('matieres.id', 'nom', 'slug'),
                ]),
        ])->loadCount('cours'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->mahdaraRules());
        $mahdara = Mahdara::create($validated);

        return response()->json([
            'message' => 'Mahdara ajoutée avec succès.',
            'mahdara' => $mahdara,
        ], 201);
    }

    public function update(Request $request, Mahdara $mahdara)
    {
        $mahdara->update($request->validate($this->mahdaraRules(partial: true)));

        return response()->json([
            'message' => 'Mahdara mise à jour avec succès.',
            'mahdara' => $mahdara->refresh(),
        ]);
    }

    public function destroy(Mahdara $mahdara)
    {
        $mahdara->delete();

        return response()->json(['message' => 'Mahdara supprimée avec succès.']);
    }

    private function mahdaraRules(bool $partial = false): array
    {
        $prefix = $partial ? 'sometimes|' : '';

        return [
            'nom' => $prefix.'required|string|max:255',
            'wilaya' => $prefix.'required|string|max:255',
            'localisation' => $prefix.'nullable|string|max:255',
            'description' => $prefix.'nullable|string|max:10000',
            'actif' => $prefix.'sometimes|boolean',
        ];
    }
}
