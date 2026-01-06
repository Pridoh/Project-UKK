<?php

namespace App\Modules\Home\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menampilkan home/welcome page
 * Thin controller untuk render view
 */
class HomeController extends Controller
{
    /**
     * Show the welcome page.
     */
    public function index(): Response
    {
        return Inertia::render('welcome');
    }
}

