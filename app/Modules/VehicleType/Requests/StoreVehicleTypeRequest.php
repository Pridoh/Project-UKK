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
            'kode' => 'required|string|max:255|unique:tb_vehicle_type,kode',
            'nama_tipe' => 'required|string|max:255',
            'ukuran_slot' => 'required|integer|min:1',
            'tarif_dasar' => 'required|integer|min:0',
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
            'kode' => 'vehicle code',
            'nama_tipe' => 'vehicle type name',
            'ukuran_slot' => 'slot size',
            'tarif_dasar' => 'base rate',
        ];
    }
}
