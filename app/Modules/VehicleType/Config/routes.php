<?php

use App\Modules\VehicleType\Controllers\VehicleTypeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->controller(VehicleTypeController::class)->prefix('vehicletype')->name('vehicletype.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/', 'store')->name('store');
    Route::put('/{vehicletype}', 'update')->name('update');
    Route::patch('/{vehicletype}', 'update')->name('update');
    Route::delete('/{vehicletype}', 'destroy')->name('destroy');
});
