<?php

use App\Http\Controllers\FormationController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ProgressController;
use Illuminate\Support\Facades\Route;

Route::post('/import', [ImportController::class, 'store']);

Route::get('/formations', [FormationController::class, 'index']);
Route::get('/formations/{formation}', [FormationController::class, 'show']);
Route::get('/formations/{formation}/lessons/{moduleSlug}/{lessonSlug}', [LessonController::class, 'show']);

Route::get('/formations/{formation}/progress', [ProgressController::class, 'index']);
Route::post('/formations/{formation}/progress/{moduleSlug}/{lessonSlug}', [ProgressController::class, 'toggle']);
