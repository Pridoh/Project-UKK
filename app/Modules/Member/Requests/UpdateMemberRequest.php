<?php

namespace App\Modules\Member\Requests;

use App\Modules\Member\Models\Member;
use App\Modules\Member\Services\MemberService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMemberRequest extends FormRequest
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
            'vehicle_id' => 'sometimes|uuid|exists:tb_vehicles,id',
            'nama' => 'sometimes|string|max:255',
            'tipe_member' => 'sometimes|integer|in:1,2,3',
            'package_duration' => 'sometimes|integer|in:1,3,6,12',
            'diskon' => 'sometimes|numeric|min:0|max:100',
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
            'vehicle_id' => 'vehicle',
            'nama' => 'member name',
            'tipe_member' => 'member type',
            'package_duration' => 'membership package',
            'diskon' => 'discount',
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
            'vehicle_id.exists' => 'The selected vehicle does not exist.',
            'tipe_member.in' => 'The member type must be Regular, Silver, or Gold.',
            'package_duration.in' => 'The membership package must be Monthly, Quarterly, Semi-Annual, or Yearly.',
            'diskon.min' => 'The discount cannot be negative.',
            'diskon.max' => 'The discount cannot exceed 100%.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$validator->errors()->has('vehicle_id')) {
                $service = app(MemberService::class);
                $member = $this->route('member');

                // Determine dates to check
                if ($this->has('package_duration')) {
                    // If package is changing, check new dates from today
                    $startDate = now()->toDateString();
                    $endDate = now()->addMonths($this->package_duration)->subDay()->toDateString();
                } else {
                    // If package not changing, we use existing dates.
                    // This covers cases where only vehicle_id might be changing.
                    $startDate = $member->start_date;
                    $endDate = $member->end_date;
                }

                $vehicleId = $this->vehicle_id ?? $member->vehicle_id;

                // Validate overlap excluding the current member
                $isValid = $service->validateMembershipDates(
                    $startDate,
                    $endDate,
                    $vehicleId,
                    $member->id
                );

                if (!$isValid) {
                    $validator->errors()->add(
                        'vehicle_id',
                        'This vehicle already has an active membership during the selected period.'
                    );
                }
            }
        });
    }
}
