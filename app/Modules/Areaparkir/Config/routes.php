<?php

use App\Modules\Areaparkir\Controllers\AreaParkirController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:Admin'])->controller(AreaParkirController::class)->prefix('areaparkir')->name('areaparkir.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/create', 'create')->name('create');
    Route::post('/', 'store')->name('store');
    Route::get('/{areaparkir}', 'show')->name('show');
    Route::get('/{areaparkir}/edit', 'edit')->name('edit');
    Route::put('/{areaparkir}', 'update')->name('update');
    Route::patch('/{areaparkir}', 'update')->name('update');
    Route::delete('/{areaparkir}', 'destroy')->name('destroy');
});
