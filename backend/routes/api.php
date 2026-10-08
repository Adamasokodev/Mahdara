<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\CheikhController;
use App\Http\Controllers\Api\CoursController;
use App\Http\Controllers\Api\MahdaraController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/cheikhs/pending', [AdminController::class, 'pendingCheikhs']);
    Route::post('/cheikhs/{user}/approve', [AdminController::class, 'approve']);
    Route::post('/cheikhs/{user}/reject', [AdminController::class, 'reject']);
});

Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/me', [AuthController::class, 'me'])->name('me');

// Route::get('/mahdara', [CheikhController::class, 'index'])->name('mahdara.index');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/cheikh', [CheikhController::class, 'index'])->name('cheikh.index');
    Route::post('/cheikh', [CheikhController::class, 'store'])->name('cheikh.store');

    Route::get('/mahdara', [MahdaraController::class, 'index'])->name('mahdara.index');
    Route::post('/mahdara', [MahdaraController::class, 'store'])->name('mahdara.store');

    Route::get('/cours', [CoursController::class, 'index'])->name('cours.index');
    Route::post('/cours', [CoursController::class, 'store'])->name('cours.store');
});
