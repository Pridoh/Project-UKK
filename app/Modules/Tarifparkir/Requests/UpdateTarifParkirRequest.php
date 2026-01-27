<?php

namespace App\Modules\Tarifparkir\Requests;

use App\Modules\Tarifparkir\Services\TarifParkirService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTarifParkirRequest extends FormRequest
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
            'vehicle_type_id' => 'required|uuid|exists:tb_vehicle_type,id',
            'durasi_min' => 'required|integer|min:0',
            'durasi_max' => 'required|integer|gt:durasi_min',
            'harga' => 'required|integer|min:0',
            'is_active' => 'required|boolean',
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
            'vehicle_type_id' => 'vehicle type',
            'durasi_min' => 'minimum duration',
            'durasi_max' => 'maximum duration',
            'harga' => 'price',
            'is_active' => 'active status',
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
            'durasi_max.gt' => 'The maximum duration must be greater than the minimum duration.',
            'vehicle_type_id.exists' => 'The selected vehicle type does not exist.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$validator->errors()->has('durasi_min') && !$validator->errors()->has('durasi_max')) {
                $service = app(TarifParkirService::class);

                // Get the current tariff ID from route parameter
                $tariffId = $this->route('tarifparkir');

                $isValid = $service->validateDurationRange(
                    $this->durasi_min,
                    $this->durasi_max,
                    $this->vehicle_type_id,
                    $tariffId instanceof \App\Modules\Tarifparkir\Models\TarifParkir ? $tariffId->id : $tariffId
                );

                if (!$isValid) {
                    $validator->errors()->add(
                        'durasi_min',
                        'The duration range overlaps with an existing tariff for this vehicle type.'
                    );
                }
            }
        });
    }
}
