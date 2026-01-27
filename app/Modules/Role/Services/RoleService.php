<?php

namespace App\Modules\Role\Services;

use App\Modules\User\Models\Role as RoleModel;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Service class untuk menangani business logic role management
 */
class RoleService
{
    /**
     * Get all roles for dropdown
     */
    public function getAllRoles(): Collection
    {
        return RoleModel::orderBy('role_name')->get(['id', 'role_name']);
    }

    /**
     * Create new role
     */
    public function createRole(array $data): RoleModel
    {
        $data['id'] = Str::uuid();

        return RoleModel::create($data);
    }
}
