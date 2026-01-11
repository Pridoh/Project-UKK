<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menangani password confirmation
 * Thin controller yang hanya memanggil AuthService
 */
class ConfirmablePasswordController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {
    }

    /**
     * Show the confirm password page.
     */
    public function show(): Response
    {
        return Inertia::render('auth/confirm-password');
    }

    /**
     * Confirm the user's password.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $this->authService->confirmPassword($request);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}

