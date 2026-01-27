<?php

namespace App\Modules\Datavehicle\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: Add proper authorization logic (admin only)
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
            'plat_nomor' => 'required|string|max:20|unique:tb_vehicles,plat_nomor',
            'nama_pemilik' => 'nullable|string|max:100',
            'vehicle_type_id' => 'required|uuid|exists:tb_vehicle_type,id',
            'status' => 'required|integer|in:0,1',
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
            'plat_nomor' => 'plate number',
            'nama_pemilik' => 'owner name',
            'vehicle_type_id' => 'vehicle type',
            'status' => 'status',
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'plat_nomor.unique' => 'This plate number is already registered in the system.',
            'vehicle_type_id.exists' => 'The selected vehicle type does not exist.',
            'status.in' => 'The status must be either active or inactive.',
        ];
    }
}
