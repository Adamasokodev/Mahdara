<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cours;
use Illuminate\Http\Request;

class CoursController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cours = Cours::select('id', 'titre', 'matiere', 'cheikh_id', 'mahdara_id', 'fichier_url', 'duree_minutes', 'niveau')->get();
        return response()->json($cours);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string|max:100',
            'matiere' => 'required|string|max:100',
            'cheikh_id' => 'required|exists:cheikhs,id',
            'mahdara_id' => 'required|exists:mahdaras,id',
            'fichier_url' => 'required|string|max:100',
            'duree_minutes' => 'required|integer',
            'niveau' => 'required|string|max:100',
        ]);

        $cours = Cours::create([
            'titre' => $request->titre,
            'matiere' => $request->matiere,
            'cheikh_id' => $request->cheikh_id,
            'mahdara_id' => $request->mahdara_id,
            'fichier_url' => $request->fichier_url,
            'duree_minutes' => $request->duree_minutes,
            'niveau' => $request->niveau
        ]);
        return response()->json(['message' => 'Cours ajouté avec succès.', '    cours' => $cours], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Cours $cours)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cours $cours)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cours $cours)
    {
        //
    }
}
