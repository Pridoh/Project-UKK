<?php

namespace App\Modules\Member\Requests;

use App\Modules\Member\Models\Member;
use App\Modules\Member\Services\MemberService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMemberRequest extends FormRequest
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
            'vehicle_id' => 'required|uuid|exists:tb_vehicles,id',
            'nama' => 'required|string|max:255',
            'tipe_member' => 'required|integer|in:1,2,3',
            'package_duration' => 'required|integer|in:1,3,6,12',
            'diskon' => 'required|numeric|min:0|max:100',
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
            if (!$validator->errors()->has('vehicle_id') && $this->has('package_duration')) {
                $service = app(MemberService::class);

                // Calculate implied dates
                $startDate = now()->toDateString();
                $endDate = now()->addMonths($this->package_duration)->subDay()->toDateString();

                $isValid = $service->validateMembershipDates(
                    $startDate,
                    $endDate,
                    $this->vehicle_id
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
