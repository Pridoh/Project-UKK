<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

/**
 * Controller untuk verify email
 * Thin controller yang hanya memanggil AuthService
 */
class VerifyEmailController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {
    }

    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $this->authService->verifyEmail($request);

        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    }
}

