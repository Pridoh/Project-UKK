<?php

namespace App\Modules\Transaction\Requests;

use App\Modules\Transaction\Models\Transaction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckOutRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'transaction_id' => [
                'required',
                'uuid',
                'exists:tb_transaksi,id',
            ],
            'metode_pembayaran' => [
                'required',
                'integer',
                Rule::in([
                    Transaction::PAYMENT_CASH,
                    Transaction::PAYMENT_CARD,
                    Transaction::PAYMENT_EWALLET,
                ]),
            ],
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
            'transaction_id' => 'transaksi',
            'metode_pembayaran' => 'metode pembayaran',
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
            'transaction_id.required' => 'Transaksi harus dipilih.',
            'transaction_id.exists' => 'Transaksi yang dipilih tidak ditemukan.',
            'metode_pembayaran.required' => 'Metode pembayaran harus dipilih.',
            'metode_pembayaran.in' => 'Metode pembayaran tidak valid.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$validator->errors()->has('transaction_id')) {
                // Check if transaction is still active (status = IN)
                $transaction = Transaction::find($this->transaction_id);

                if ($transaction && $transaction->status !== Transaction::STATUS_IN) {
                    $validator->errors()->add(
                        'transaction_id',
                        'Transaksi ini sudah selesai atau dibatalkan. Tidak dapat melakukan check-out.'
                    );
                }
            }
        });
    }
}
