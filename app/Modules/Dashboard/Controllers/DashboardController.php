<?php

namespace App\Modules\Dashboard\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Dashboard\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menampilkan dashboard
 * Thin controller untuk render view
 */
class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    /**
     * Show the dashboard page.
     */
    public function index(): Response
    {
        $dashboardData = $this->dashboardService->getAllDashboardData();

        return Inertia::render('dashboard', [
            'stats' => $dashboardData['stats'],
            'revenue' => $dashboardData['revenue'],
            'slotTracking' => $dashboardData['slotTracking'],
            'charts' => $dashboardData['charts'],
        ]);
    }
}
