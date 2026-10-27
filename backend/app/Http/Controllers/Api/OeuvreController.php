<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Oeuvre;
use Illuminate\Http\Request;

class OeuvreController extends Controller
{
    public function index(Request $request)
    {
        $query = Oeuvre::query()
            ->where('statut', 'publie')
            ->orderBy('ordre')
            ->orderBy('titre');

        if ($request->filled('type')) {
            $query->where('type', $request->string('type')->toString());
        }

        return response()->json($query->get()->map(fn (Oeuvre $oeuvre): array => [
            'id' => $oeuvre->id,
            'titre' => $oeuvre->titre,
            'type' => $oeuvre->type,
            'auteur' => $oeuvre->auteur,
            'langue' => $oeuvre->langue,
            'confrerie' => $oeuvre->confrerie,
            'description' => $oeuvre->description,
            'aide_pedagogique' => $oeuvre->aide_pedagogique,
            'url' => $oeuvre->fichier_path
                ? url('/media/'.ltrim($oeuvre->fichier_path, '/'))
                : $oeuvre->source_url,
        ]));
    }
}
