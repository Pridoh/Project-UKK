<?php

namespace App\Modules\Role\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Role\Requests\StoreRoleRequest;
use App\Modules\Role\Services\RoleService;
use Illuminate\Http\RedirectResponse;

/**
 * Controller untuk menangani role
 * Thin controller yang hanya memanggil RoleService
 */
class RoleController extends Controller
{
    public function __construct(
        protected RoleService $roleService
    ) {}

    /**
     * Store a newly created role in storage.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = $this->roleService->createRole($request->validated());

        return redirect()->back()
            ->with('success', 'Role created successfully')
            ->with('new_role', $role);
    }
}
