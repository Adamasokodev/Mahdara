<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheikhController;
use App\Http\Controllers\Api\CoursController;
use App\Http\Controllers\Api\MahdaraController;
use App\Http\Controllers\Api\MatiereController;
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

Route::post('/register', [AuthController::class, 'register'])->name('api.register');
Route::post('/login', [AuthController::class, 'login'])->name('api.login');
Route::get('/me', [AuthController::class, 'me'])->name('me');

Route::get('/cheikh', [CheikhController::class, 'index'])->name('cheikh.index');
Route::get('/mahdara', [MahdaraController::class, 'index'])->name('mahdara.index');
Route::get('/matiere', [MatiereController::class, 'index'])->name('matiere.index');
Route::get('/cours', [CoursController::class, 'index'])->name('cours.index');
Route::get('/cours/{cours}', [CoursController::class, 'show'])->name('cours.show');
Route::get('/cheikh/{cheikh}', [CheikhController::class, 'show'])->name('cheikh.show');
Route::get('/mahdara/{mahdara}', [MahdaraController::class, 'show'])->name('mahdara.show');
Route::get('/matiere/{matiere}', [MatiereController::class, 'show'])->name('matiere.show');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::post('/cheikh', [CheikhController::class, 'store'])->middleware('role:admin')->name('cheikh.store');

    Route::post('/mahdara', [MahdaraController::class, 'store'])->middleware('role:admin')->name('mahdara.store');
    Route::put('/mahdara/{mahdara}', [MahdaraController::class, 'update'])->middleware('role:admin')->name('mahdara.update');
    Route::patch('/mahdara/{mahdara}', [MahdaraController::class, 'update'])->middleware('role:admin')->name('mahdara.patch');
    Route::delete('/mahdara/{mahdara}', [MahdaraController::class, 'destroy'])->middleware('role:admin')->name('mahdara.destroy');

    Route::post('/matiere', [MatiereController::class, 'store'])->middleware('role:admin')->name('matiere.store');
    Route::put('/matiere/{matiere}', [MatiereController::class, 'update'])->middleware('role:admin')->name('matiere.update');
    Route::patch('/matiere/{matiere}', [MatiereController::class, 'update'])->middleware('role:admin')->name('matiere.patch');
    Route::delete('/matiere/{matiere}', [MatiereController::class, 'destroy'])->middleware('role:admin')->name('matiere.destroy');

    Route::put('/cheikh/{cheikh}', [CheikhController::class, 'update'])->middleware('role:admin')->name('cheikh.update');
    Route::patch('/cheikh/{cheikh}', [CheikhController::class, 'update'])->middleware('role:admin')->name('cheikh.patch');
    Route::delete('/cheikh/{cheikh}', [CheikhController::class, 'destroy'])->middleware('role:admin')->name('cheikh.destroy');

    Route::post('/cours', [CoursController::class, 'store'])->middleware('role:cheikh,assistant')->name('cours.store');
    Route::put('/cours/{cours}', [CoursController::class, 'update'])->middleware('role:cheikh,assistant')->name('cours.update');
    Route::patch('/cours/{cours}', [CoursController::class, 'update'])->middleware('role:cheikh,assistant')->name('cours.patch');
    Route::delete('/cours/{cours}', [CoursController::class, 'destroy'])->middleware('role:cheikh,assistant')->name('cours.destroy');
});
