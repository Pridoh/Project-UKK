<?php

namespace App\Modules\VehicleType\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: Add proper authorization logic
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
            'kode' => 'required|string|max:255|unique:tb_vehicle_type,kode', // Auto-generated
            'nama_tipe' => 'required|string|max:255',
            'deskripsi' => 'nullable|string|max:500',
            // 'ukuran_slot' => 'required|integer|min:1', // Managed in parking area menu
            // 'tarif_dasar' => 'required|integer|min:0', // Managed in tarif menu
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
            'kode' => 'vehicle code', // Auto-generated
            'nama_tipe' => 'vehicle type name',
            'deskripsi' => 'vehicle type description',
            // 'ukuran_slot' => 'slot size', // Managed in parking area menu
            // 'tarif_dasar' => 'base rate', // Managed in tarif menu
        ];
    }
}
