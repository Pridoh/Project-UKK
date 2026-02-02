<?php

use App\Modules\Database\Controllers\DatabaseController;
use Illuminate\Support\Facades\Route;

/**
 * Routes untuk Database Management
 * Hanya accessible oleh Admin
 */
Route::middleware(['auth', 'verified', 'role:Admin'])
    ->prefix('settings/database')
    ->name('database.')
    ->group(function () {
        Route::get('/', [DatabaseController::class, 'index'])->name('index');
        Route::post('/backup', [DatabaseController::class, 'backup'])->name('backup');
        Route::post('/upload-restore', [DatabaseController::class, 'uploadRestore'])->name('upload-restore');
        Route::post('/restore', [DatabaseController::class, 'restore'])->name('restore');
        Route::get('/download/{id}', [DatabaseController::class, 'download'])->name('download');
        Route::delete('/{id}', [DatabaseController::class, 'destroy'])->name('destroy');
    });
