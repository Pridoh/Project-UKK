<?php

use App\Modules\Member\Controllers\MemberController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->controller(MemberController::class)->prefix('member')->name('member.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/', 'store')->name('store');
    Route::put('/{member}', 'update')->name('update');
    Route::patch('/{member}', 'update');
    Route::delete('/{member}', 'destroy')->name('destroy');
});
