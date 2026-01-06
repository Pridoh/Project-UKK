<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menampilkan email verification prompt
 * Thin controller yang hanya memanggil AuthService
 */
class EmailVerificationPromptController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Show the email verification prompt page.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if ($this->authService->hasVerifiedEmail($request)) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        return Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]);
    }
}
