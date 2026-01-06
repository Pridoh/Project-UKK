<?php

namespace App\Modules\Settings\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menangani appearance settings
 * Thin controller untuk render view
 */
class AppearanceController extends Controller
{
    /**
     * Show the appearance settings page.
     */
    public function index(): Response
    {
        return Inertia::render('settings/appearance');
    }
}
