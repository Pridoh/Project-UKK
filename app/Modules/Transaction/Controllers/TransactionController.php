<?php

namespace App\Modules\Transaction\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Transaction\Models\Transaction;
use App\Modules\Transaction\Requests\CheckInRequest;
use App\Modules\Transaction\Requests\CheckOutRequest;
use App\Modules\Transaction\Services\TransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menangani transaksi parkir management
 * Thin controller yang hanya memanggil TransactionService
 */
class TransactionController extends Controller
{
    public function __construct(
        protected TransactionService $transactionService
    ) {}

    /**
     * Display the transaction management page with active transactions
     */
    public function index(Request $request): Response
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->input('search');

        $activeTransactions = $this->transactionService->getActiveTransactions($perPage, $search);
        $vehicles = $this->transactionService->getActiveVehicles();
        $areas = $this->transactionService->getActiveParkingAreas();
        $vehicleTypes = $this->transactionService->getActiveVehicleTypes();
        $paymentMethods = Transaction::getPaymentMethods();
        $stats = $this->transactionService->getTransactionStats();

        return Inertia::render('transaction/index', [
            'activeTransactions' => $activeTransactions,
            'vehicles' => $vehicles,
            'areas' => $areas,
            'vehicleTypes' => $vehicleTypes,
            'paymentMethods' => $paymentMethods,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Process vehicle check-in
     */
    public function checkIn(CheckInRequest $request): RedirectResponse
    {
        try {
            $transaction = $this->transactionService->checkIn($request->validated());

            return back()
                ->with('success', 'Kendaraan berhasil check-in. Kode transaksi: ' . $transaction->kode_transaksi)
                ->with('transaction', $transaction->load(['vehicle', 'area', 'vehicleType', 'user']));
        } catch (\Exception $e) {
            Log::error('Check-in error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'data' => $request->validated()
            ]);

            return back()
                ->with('error', 'Gagal melakukan check-in: ' . $e->getMessage());
        }
    }

    /**
     * Process vehicle check-out
     */
    public function checkOut(CheckOutRequest $request): RedirectResponse
    {
        try {
            $transaction = $this->transactionService->checkOut(
                $request->transaction_id,
                $request->validated()
            );

            return back()
                ->with('success', 'Kendaraan berhasil check-out. Total pembayaran: ' . $transaction->formatted_total_bayar)
                ->with('transaction', $transaction->load(['vehicle', 'area', 'vehicleType', 'user']));
        } catch (ValidationException $e) {
            Log::error('Check-out validation error: ' . $e->getMessage());
            return back()
                ->withErrors($e->errors())
                ->with('error', collect($e->errors())->flatten()->first());
        } catch (\Exception $e) {
            Log::error('Check-out error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'data' => $request->validated()
            ]);

            return back()
                ->with('error', 'Gagal melakukan check-out: ' . $e->getMessage());
        }
    }

    /**
     * Display vehicle entry page (active transactions)
     */
    public function entry(Request $request): Response
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->input('search');

        $transactions = $this->transactionService->getActiveTransactions($perPage, $search);

        return Inertia::render('transaction/entry', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display transaction history page
     */
    public function history(Request $request): Response
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->input('search');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $status = $request->input('status');

        $transactions = $this->transactionService->getTransactionHistory(
            $perPage,
            $search,
            $startDate,
            $endDate,
            $status
        );

        $statuses = Transaction::getStatuses();

        return Inertia::render('transaction/history', [
            'transactions' => $transactions,
            'statuses' => $statuses,
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show transaction details
     */
    public function show(Transaction $transaction): Response
    {
        $transaction->load(['vehicle', 'area', 'vehicleType', 'tarif', 'user']);

        return Inertia::render('transaction/show', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Search for active transaction by plate or code
     */
    public function search(Request $request)
    {
        $search = $request->input('search');

        if (!$search) {
            return response()->json(['transaction' => null]);
        }

        $transaction = $this->transactionService->searchTransaction($search);

        if ($transaction) {
            // Load formatted values
            $transaction->load(['vehicle.member', 'area', 'vehicleType', 'user']);
            $transaction->formatted_total_bayar = 'Rp ' . number_format($transaction->total_bayar, 0, ',', '.');

            // Format duration
            if ($transaction->durasi) {
                $hours = floor($transaction->durasi / 60);
                $minutes = $transaction->durasi % 60;
                $transaction->duration_formatted = "{$hours} jam {$minutes} menit";
            }
        }

        return response()->json(['transaction' => $transaction]);
    }

    /**
     * Cancel a transaction
     */
    public function cancel(Transaction $transaction): RedirectResponse
    {
        try {
            $this->transactionService->cancelTransaction($transaction->id);

            return redirect()->route('transaction.index')
                ->with('success', 'Transaksi berhasil dibatalkan.');
        } catch (\Exception $e) {
            return redirect()->route('transaction.index')
                ->with('error', 'Gagal membatalkan transaksi: ' . $e->getMessage());
        }
    }
}
