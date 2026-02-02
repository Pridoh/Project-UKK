<?php

use App\Modules\Role\Controllers\RoleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:Admin'])->controller(RoleController::class)->name('role.')->group(function () {
    Route::post('/', 'store')->name('store');
});
