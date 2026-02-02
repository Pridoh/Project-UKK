<?php

use App\Modules\Transaction\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:Petugas'])->controller(TransactionController::class)->prefix('transaction')->name('transaction.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::post('/check-in', 'checkIn')->name('checkin');
    Route::post('/check-out', 'checkOut')->name('checkout');
    Route::get('/search', 'search')->name('search'); // New search endpoint
    Route::get('/entry', 'entry')->name('entry');
    Route::get('/history', 'history')->name('history');
    Route::get('/{transaction}', 'show')->name('show');
    Route::post('/{transaction}/cancel', 'cancel')->name('cancel');
});
