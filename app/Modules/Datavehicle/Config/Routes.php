<?php

use App\Modules\Datavehicle\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:Admin'])->controller(VehicleController::class)->prefix('datavehicle')->name('datavehicle.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/', 'store')->name('store');
    Route::put('/{datavehicle}', 'update')->name('update');
    Route::patch('/{datavehicle}', 'update')->name('update');
    Route::delete('/{datavehicle}', 'destroy')->name('destroy');
});
