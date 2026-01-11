<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Controller untuk mengirim email verification notification
 * Thin controller yang hanya memanggil AuthService
 */
class EmailVerificationNotificationController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {
    }

    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($this->authService->hasVerifiedEmail($request)) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $this->authService->sendEmailVerificationNotification($request);

        return back()->with('status', 'verification-link-sent');
    }
}

