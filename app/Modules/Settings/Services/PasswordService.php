<?php

namespace App\Modules\Settings\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

/**
 * Service class untuk menangani business logic password settings
 */
class PasswordService
{
    /**
     * Update user password
     */
    public function updatePassword(User $user, string $password): void
    {
        $user->update([
            'password' => Hash::make($password),
        ]);
    }
}

