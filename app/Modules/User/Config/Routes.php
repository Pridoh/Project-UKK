<?php

use App\Modules\User\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:Admin'])->controller(UserController::class)->prefix('user')->name('user.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/', 'store')->name('store');
    Route::put('/{user}', 'update')->name('update');
    Route::patch('/{user}', 'update')->name('update');
    Route::delete('/{user}', 'destroy')->name('destroy');
});
