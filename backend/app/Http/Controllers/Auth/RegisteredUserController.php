<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    public function create(): View
    {
        return view('auth.register');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'telephone' => ['required', 'unique:users,telephone', 'regex:/^(\+222)?[234][0-9]{7}$/'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            'role' => 'student',
            'status' => 'pending',
        ]);

        return redirect()
            ->route('register')
            ->with('status', 'Votre inscription a été envoyée. Votre compte sera activé après validation par un administrateur.');
    }
}
