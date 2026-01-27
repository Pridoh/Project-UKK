<?php

namespace App\Modules\User\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\User\Models\User as UserModel;
use App\Modules\User\Requests\StoreUserRequest;
use App\Modules\User\Requests\UpdateUserRequest;
use App\Modules\User\Services\UserService;
use App\Modules\Role\Services\RoleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menangani user management
 * Thin controller yang hanya memanggil UserService
 */
class UserController extends Controller
{
    public function __construct(
        protected UserService $userService,
        protected RoleService $roleService
    ) {}

    /**
     * Display a listing of the users.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->integer('per_page', 10);

        $users = $this->userService->getAllUsers($perPage);
        $roles = $this->roleService->getAllRoles();

        return Inertia::render('user/index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $roles = $this->roleService->getAllRoles();

        return Inertia::render('user/create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->userService->createUser($request->validated());

        return redirect()->route('user.index')
            ->with('success', 'User created successfully');
    }

    /**
     * Display the specified user.
     */
    public function show(UserModel $user): Response
    {
        $user = $this->userService->getUserById($user->id);

        return Inertia::render('user/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(UserModel $user): Response
    {
        $user = $this->userService->getUserById($user->id);
        $roles = $this->roleService->getAllRoles();

        return Inertia::render('user/edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, UserModel $user): RedirectResponse
    {
        $this->userService->updateUser($user, $request->validated());

        return redirect()->route('user.index')
            ->with('success', 'User updated successfully');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, UserModel $user): RedirectResponse
    {
        $this->userService->deleteUser($user, $request->user());

        return redirect()->route('user.index')
            ->with('success', 'User deleted successfully');
    }
}
