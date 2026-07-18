<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CandidatureController;
use App\Http\Controllers\CoursesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EtatController;
use App\Http\Controllers\JalonController;
use App\Http\Controllers\DocController;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ParcoursController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\ResultsController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\RevueController;
use App\Http\Controllers\SuiviController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// --- Authentification ---
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});

// ⚠️ DEBUG / perso uniquement — liste tous les comptes. À SUPPRIMER si le projet
// n'est plus personnel (voir l'avertissement dans UserController).
Route::get('/users', [UserController::class, 'index']);

Route::get('/docs/{doc}', [DocController::class, 'show']);

Route::post('/import', [ImportController::class, 'store']);

// Parcours (roadmaps : étapes « formation » interne + « jalon » externe)
Route::get('/parcours', [ParcoursController::class, 'index']);
Route::get('/parcours/{slug}', [ParcoursController::class, 'show']);
// Atelier parcours : création/édition/suppression (écrit les YAML de /content/_parcours).
Route::post('/parcours', [ParcoursController::class, 'store']);
Route::put('/parcours/{slug}', [ParcoursController::class, 'update']);
Route::delete('/parcours/{slug}', [ParcoursController::class, 'destroy']);

Route::get('/formations', [FormationController::class, 'index']);
Route::get('/content/formations', [FormationController::class, 'availableContent']);
Route::post('/formations/{slug}/import', [FormationController::class, 'import']);
Route::get('/formations/{formation}', [FormationController::class, 'show']);
Route::get('/formations/{formation}/lessons/{moduleSlug}/{lessonSlug}', [LessonController::class, 'show']);
Route::post('/formations/{formation}/lessons/{moduleSlug}/{lessonSlug}/grade', [QuizController::class, 'grade']);
Route::get('/formations/{formation}/lessons/{moduleSlug}/{lessonSlug}/attempts', [ResultsController::class, 'attempts']);

// Résultats : synthèse des tests de niveau (tentatives avec un niveau CEFR), tous cours confondus.
Route::get('/me/results', [ResultsController::class, 'results']);

// Répétition espacée (SRS) : cartes à réviser aujourd'hui + enregistrement d'une révision.
Route::get('/me/cards/due', [ReviewController::class, 'due']);
Route::post('/formations/{formation}/lessons/{moduleSlug}/{lessonSlug}/cards/{index}/review', [ReviewController::class, 'review']);

// Tableau de bord apprenant : niveau, série (streak), maîtrise par tag/niveau.
Route::get('/me/dashboard', [DashboardController::class, 'show']);

// Suivi centralisé : préparation certifs (tests blancs), activité, santé SRS.
Route::get('/me/suivi', [SuiviController::class, 'show']);

// Plan de carrière 6 mois : jalons datés, tracker candidatures/contacts, revues hebdo.
Route::get('/jalons', [JalonController::class, 'index']);
Route::post('/jalons', [JalonController::class, 'store']);
Route::post('/jalons/seed-plan', [JalonController::class, 'seedPlan']);
Route::put('/jalons/{id}', [JalonController::class, 'update']);
Route::delete('/jalons/{id}', [JalonController::class, 'destroy']);
Route::get('/candidatures', [CandidatureController::class, 'index']);
Route::post('/candidatures', [CandidatureController::class, 'store']);
Route::put('/candidatures/{id}', [CandidatureController::class, 'update']);
Route::delete('/candidatures/{id}', [CandidatureController::class, 'destroy']);
Route::get('/revues', [RevueController::class, 'index']);
Route::post('/revues', [RevueController::class, 'upsert']);

// État complet pour l'assistant IA (lecture seule, JSON auto-descriptif).
Route::get('/suivi/etat', [EtatController::class, 'show']);

// Mes cours : formations commencées, progression, reprise (hub d'accueil).
Route::get('/me/courses', [CoursesController::class, 'mine']);

Route::get('/formations/{formation}/progress', [ProgressController::class, 'index']);
Route::post('/formations/{formation}/progress/{moduleSlug}/{lessonSlug}', [ProgressController::class, 'toggle']);
