<?php

namespace App\Modules\Settings\Services;

use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;

/**
 * Service class untuk menangani business logic profile settings
 */
class ProfileService
{
    /**
     * Update user profile
     */
    public function updateProfile(User $user, array $validated): void
    {
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();
    }

    /**
     * Delete user account
     */
    public function deleteAccount(User $user): void
    {
        $user->delete();
    }

    /**
     * Check if user must verify email
     */
    public function mustVerifyEmail(User $user): bool
    {
        return $user instanceof MustVerifyEmail;
    }
}

