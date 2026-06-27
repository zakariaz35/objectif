<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

// --- Authentification ---
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});

Route::post('/import', [ImportController::class, 'store']);

Route::get('/formations', [FormationController::class, 'index']);
Route::get('/formations/{formation}', [FormationController::class, 'show']);
Route::get('/formations/{formation}/lessons/{moduleSlug}/{lessonSlug}', [LessonController::class, 'show']);
Route::post('/formations/{formation}/lessons/{moduleSlug}/{lessonSlug}/grade', [QuizController::class, 'grade']);

Route::get('/formations/{formation}/progress', [ProgressController::class, 'index']);
Route::post('/formations/{formation}/progress/{moduleSlug}/{lessonSlug}', [ProgressController::class, 'toggle']);
