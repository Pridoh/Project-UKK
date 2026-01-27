<?php

namespace App\Modules\User\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: Add proper authorization logic
        // return $this->user()->can('update', $this->route('user'));
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'name' => 'required|string|max:255',
            'username' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('tb_user', 'username')->ignore($userId, 'id'),
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('tb_user', 'email')->ignore($userId, 'id'),
            ],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
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
