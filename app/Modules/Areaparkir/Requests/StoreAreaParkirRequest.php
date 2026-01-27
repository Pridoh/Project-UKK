<?php

namespace App\Modules\Areaparkir\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAreaParkirRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: Add proper authorization logic
        // return $this->user()->can('create', AreaParkir::class);
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
            'kode_area' => 'required|string|max:255|unique:tb_area,kode_area',
            'nama_area' => 'required|string|max:255',
            'lokasi' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'kapasitas' => 'required|array|min:1',
            'kapasitas.*.vehicle_type_id' => 'required|uuid|exists:tb_vehicle_type,id',
            'kapasitas.*.kapasitas' => 'required|integer|min:0',
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
            'kode_area' => 'area code',
            'nama_area' => 'area name',
            'lokasi' => 'location/photo',
            'kapasitas' => 'capacity',
            'kapasitas.*.vehicle_type_id' => 'vehicle type',
            'kapasitas.*.kapasitas' => 'capacity value',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'kapasitas.required' => 'At least one vehicle type capacity is required.',
            'kapasitas.min' => 'At least one vehicle type capacity is required.',
        ];
    }
}
