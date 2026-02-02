<?php

namespace App\Modules\Transaction\Requests;

use App\Modules\Datavehicle\Models\Vehicle;
use App\Modules\Transaction\Models\Transaction;
use App\Modules\Transaction\Services\TransactionService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CheckInRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: Add proper authorization logic (petugas or admin only)
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'vehicle_id' => 'nullable|uuid|exists:tb_vehicles,id',
            'plat_nomor' => 'nullable|string|max:20',
            'nama_pemilik' => 'nullable|string|max:100',
            'area_id' => 'required|uuid|exists:tb_area,id',
            'vehicle_type_id' => 'required|uuid|exists:tb_vehicle_type,id',
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
            'vehicle_id' => 'kendaraan',
            'area_id' => 'area parkir',
            'vehicle_type_id' => 'tipe kendaraan',
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
            'vehicle_id.required' => 'Kendaraan harus dipilih.',
            'vehicle_id.uuid' => 'Format ID kendaraan tidak valid.',
            'vehicle_id.exists' => 'Kendaraan tidak ditemukan.',
            'plat_nomor.string' => 'Plat nomor harus berupa teks.',
            'plat_nomor.max' => 'Plat nomor maksimal 20 karakter.',
            'area_id.required' => 'Area parkir harus dipilih.',
            'area_id.uuid' => 'Format ID area tidak valid.',
            'area_id.exists' => 'Area parkir tidak ditemukan.',
            'vehicle_type_id.required' => 'Tipe kendaraan harus dipilih.',
            'vehicle_type_id.uuid' => 'Format ID tipe kendaraan tidak valid.',
            'vehicle_type_id.exists' => 'Tipe kendaraan tidak ditemukan.',
        ];
    }

    /**
     * Custom validation logic
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Either vehicle_id or plat_nomor must be provided
            if (!$this->vehicle_id && !$this->plat_nomor) {
                $validator->errors()->add(
                    'vehicle_id',
                    'Silakan pilih kendaraan yang sudah ada atau masukkan plat nomor baru.'
                );
                return;
            }

            // Check for duplicate active transaction
            if ($this->vehicle_id) {
                $hasActiveTransaction = Transaction::where('vehicle_id', $this->vehicle_id)
                    ->where('status', Transaction::STATUS_IN)
                    ->exists();

                if ($hasActiveTransaction) {
                    $validator->errors()->add(
                        'vehicle_id',
                        'Kendaraan ini sudah memiliki transaksi aktif. Silakan lakukan check-out terlebih dahulu.'
                    );
                }
            } elseif ($this->plat_nomor) {
                // Check if plate number already has active transaction
                $vehicle = Vehicle::where('plat_nomor', $this->plat_nomor)->first();
                if ($vehicle) {
                    $hasActiveTransaction = Transaction::where('vehicle_id', $vehicle->id)
                        ->where('status', Transaction::STATUS_IN)
                        ->exists();

                    if ($hasActiveTransaction) {
                        $validator->errors()->add(
                            'plat_nomor',
                            'Kendaraan dengan plat nomor ini sudah memiliki transaksi aktif.'
                        );
                    }
                }
            }
        });
    }
}
