<?php

use App\Modules\Tarifparkir\Controllers\TarifParkirController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->controller(TarifParkirController::class)->prefix('tarifparkir')->name('tarifparkir.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/', 'store')->name('store');
    Route::put('/{tarifparkir}', 'update')->name('update');
    Route::patch('/{tarifparkir}', 'update')->name('update');
    Route::delete('/{tarifparkir}', 'destroy')->name('destroy');
});
