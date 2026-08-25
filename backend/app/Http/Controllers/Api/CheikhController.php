<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cheikh;
use Illuminate\Http\Request;

class CheikhController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cheikhs = Cheikh::all();
        return response()->json($cheikhs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'mahdara_id' => 'required|exists:mahdaras,id',
            'specialite' => 'required|string|max:255',
            'bio' => 'required|string'
        ]);

        $cheick = Cheikh::create([
            'user_id' => $request->user_id,
            'mahdara_id' => $request->mahdara_id,
            'specialite' => $request->specialite,
            'bio' => $request->bio
        ]);

        return response()->json(['message' => 'Cheikh ajouté avec succès.', 'cheikh' => $cheick], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Cheikh $cheikh)
    {
        return response()->json($cheikh);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cheikh $cheikh)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'mahdara_id' => 'required|exists:mahdaras,id',
            'specialite' => 'required|string|max:255',
            'bio' => 'required|string'
        ]);

        $cheikh->update([
            'user_id' => $request->user_id,
            'mahdara_id' => $request->mahdara_id,
            'specialite' => $request->specialite,
            'bio' => $request->bio
        ]);

        return response()->json(['message' => 'Cheikh mis à jour avec succès.', 'cheikh' => $cheikh]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cheikh $cheikh)
    {
        $cheikh->delete();
        return response()->json(['message' => 'Cheikh supprimé avec succès.', 'cheikh' => $cheikh], 200);
    }
}
