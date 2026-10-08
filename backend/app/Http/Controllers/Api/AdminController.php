<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function pendingCheikhs(): JsonResponse
    {
        $cheikhs = User::query()
            ->where('role', 'cheikh')
            ->where('status', 'pending')
            ->get();

        return response()->json($cheikhs);
    }

    public function approve(User $user): JsonResponse
    {
        return $this->updateCheikhStatus($user, 'active', 'Cheikh approuvé.');
    }

    public function reject(User $user): JsonResponse
    {
        return $this->updateCheikhStatus($user, 'rejected', 'Cheikh rejeté.');
    }

    private function updateCheikhStatus(User $user, string $status, string $message): JsonResponse
    {
        abort_unless($user->role === 'cheikh' && $user->status === 'pending', 404);

        $user->update(['status' => $status]);

        return response()->json([
            'message' => $message,
            'user' => $user->refresh(),
        ]);
    }
}
