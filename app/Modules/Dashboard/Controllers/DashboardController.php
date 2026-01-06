<?php

namespace App\Modules\Dashboard\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menampilkan dashboard
 * Thin controller untuk render view
 */
class DashboardController extends Controller
{
    /**
     * Show the dashboard page.
     */
    public function index(): Response
    {
        return Inertia::render('dashboard');
    }
}

