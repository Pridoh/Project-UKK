<?php

namespace App\Modules\Auth\Services;

use App\Modules\User\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

/**
 * Service class untuk menangani business logic autentikasi
 */
class AuthService
{
    /**
     * Authenticate user dengan email/username dan password
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(Request $request): void
    {
        $this->ensureIsNotRateLimited($request);

        $loginField = $request->input('email');
        $fieldType = filter_var($loginField, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $credentials = [
            $fieldType => $loginField,
            'password' => $request->input('password'),
        ];

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey($request));

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        // Check if user is active
        $user = Auth::user();
        if ($user && !$user->is_active) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => 'Your account is not active yet. Please wait for admin approval or contact the administrator.',
            ]);
        }

        RateLimiter::clear($this->throttleKey($request));
    }

    /**
     * Register user baru
     */
    public function register(Request $request): User
    {
        $user = User::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_active' => 0, // Set to inactive by default, waiting for admin approval
        ]);

        event(new Registered($user));

        // Auth::login($user); // Disable auto login for inactive users

        return $user;
    }

    /**
     * Logout user
     */
    public function logout(Request $request): void
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Clear intended URL to prevent redirect to previous page after re-login
        $request->session()->forget('url.intended');
    }

    /**
     * Send password reset link
     */
    public function sendPasswordResetLink(Request $request): string
    {
        Password::sendResetLink($request->only('email'));

        return __('A reset link will be sent if the account exists.');
    }

    /**
     * Reset password user
     */
    public function resetPassword(Request $request): string
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        return $status;
    }

    /**
     * Confirm password user
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function confirmPassword(Request $request): void
    {
        if (! Auth::guard('web')->validate([
            'email' => $request->user()->email,
            'password' => $request->password,
        ])) {
            throw ValidationException::withMessages([
                'password' => __('auth.password'),
            ]);
        }

        $request->session()->put('auth.password_confirmed_at', time());
    }

    /**
     * Send email verification notification
     */
    public function sendEmailVerificationNotification(Request $request): bool
    {
        if ($request->user()->hasVerifiedEmail()) {
            return false;
        }

        $request->user()->sendEmailVerificationNotification();

        return true;
    }

    /**
     * Mark email as verified
     */
    public function verifyEmail(Request $request): bool
    {
        if ($request->user()->hasVerifiedEmail()) {
            return false;
        }

        if ($request->user()->markEmailAsVerified()) {
            /** @var \Illuminate\Contracts\Auth\MustVerifyEmail $user */
            $user = $request->user();

            event(new \Illuminate\Auth\Events\Verified($user));
        }

        return true;
    }

    /**
     * Check if user has verified email
     */
    public function hasVerifiedEmail(Request $request): bool
    {
        return $request->user()->hasVerifiedEmail();
    }

    /**
     * Ensure the login request is not rate limited
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function ensureIsNotRateLimited(Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        event(new Lockout($request));

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request
     */
    protected function throttleKey(Request $request): string
    {
        $loginField = $request->input('email') ?? '';
        return Str::transliterate(Str::lower($loginField) . '|' . $request->ip());
    }
}
