<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mahdara;
use Illuminate\Http\Request;

class MahdaraController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $mahdaras = Mahdara::select('id', 'nom', 'wilaya', 'localisation', 'description')->get();
        return response()->json($mahdaras);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'wilaya' => 'required|string|max:255',
            'localisation' => 'nullable|string|max:255',
            'description' => 'nullable|string'
        ]);

        $mahdara = Mahdara::create([
            'nom' => $request->nom,
            'wilaya' => $request->wilaya,
            'localisation' => $request->localisation,
            'description' => $request->description
        ]);

        return response()->json(['message' => 'Mahadara ajouté avec succès.', 'mahdara' => $mahdara], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Mahdara $mahdara)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Mahdara $mahdara)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Mahdara $mahdara)
    {
        //
    }
}
