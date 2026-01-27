<?php

namespace App\Modules\User\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: Add proper authorization logic
        // return $this->user()->can('create', User::class);
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|alpha_dash|unique:tb_user,username',
            'email' => 'required|string|lowercase|email|max:255|unique:tb_user,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'is_active' => 'required|boolean',
            'role_id' => 'nullable|uuid|exists:tb_role,id',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'name',
            'username' => 'username',
            'email' => 'email address',
            'password' => 'password',
            'is_active' => 'active status',
            'role_id' => 'role',
        ];
    }
}
