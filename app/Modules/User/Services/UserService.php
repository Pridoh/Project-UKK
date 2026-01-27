<?php

namespace App\Modules\User\Services;

use App\Modules\User\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Service class untuk menangani business logic user management
 */
class UserService
{
    /**
     * Get all users with pagination and filters
     */
    public function getAllUsers(int $perPage = 10): LengthAwarePaginator
    {
        return User::with('role')
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get user by ID with role
     */
    public function getUserById(string $id): User
    {
        return User::with('role')->findOrFail($id);
    }

    /**
     * Get all roles for dropdown
     */
    // public function getAllRoles(): \Illuminate\Support\Collection
    // {
    //     return DB::table('tb_role')->get(['id', 'role_name']);
    // }

    /**
     * Create new user
     */
    public function createUser(array $data): User
    {
        $data['id'] = Str::uuid();
        $data['password'] = Hash::make($data['password']);
        $data['is_active'] = $data['is_active'] ? 1 : 0;

        return User::create($data);
    }

    /**
     * Update existing user
     */
    public function updateUser(User $user, array $data): User
    {
        if (isset($data['password']) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $data['is_active'] = $data['is_active'] ? 1 : 0;

        $user->update($data);

        return $user->fresh();
    }

    /**
     * Delete user with business rules validation
     */
    public function deleteUser(User $user, ?User $currentUser = null): void
    {
        if ($currentUser && $user->id === $currentUser->id) {
            throw ValidationException::withMessages([
                'user' => 'You cannot delete your own account from this page.',
            ]);
        }

        $user->delete();
    }
}
