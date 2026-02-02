<?php

namespace App\Modules\Transaction\Services;

use App\Modules\Areaparkir\Models\AreaParkir;
use App\Modules\Areaparkir\Models\VehicleType;
use App\Modules\Datavehicle\Models\Vehicle;
use App\Modules\Member\Models\Member;
use App\Modules\Tarifparkir\Models\TarifParkir;
use App\Modules\Transaction\Models\Transaction;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Service class untuk menangani business logic transaksi parkir
 */
class TransactionService
{
    /**
     * Process vehicle check-in
     * Supports both existing vehicles and new vehicle registration
     */
    public function checkIn(array $data): Transaction
    {
        DB::beginTransaction();
        try {
            // If plat_nomor is provided instead of vehicle_id, create or find vehicle
            if (isset($data['plat_nomor']) && !isset($data['vehicle_id'])) {
                // Check if vehicle already exists
                $vehicle = Vehicle::where('plat_nomor', $data['plat_nomor'])->first();

                if (!$vehicle) {
                    // Create new vehicle
                    $vehicle = Vehicle::create([
                        'id' => Str::uuid(),
                        'plat_nomor' => strtoupper($data['plat_nomor']),
                        'vehicle_type_id' => $data['vehicle_type_id'],
                        'nama_pemilik' => $data['nama_pemilik'] ?? null,
                        'status' => 1, // Active
                    ]);
                }

                $data['vehicle_id'] = $vehicle->id;
            }

            // Generate unique transaction code
            $data['id'] = Str::uuid();
            $data['kode_transaksi'] = $this->generateTransactionCode();
            $data['user_id'] = Auth::id();
            $data['jam_masuk'] = now();
            $data['status'] = Transaction::STATUS_IN;
            $data['payment_status'] = Transaction::PAYMENT_STATUS_PENDING;

            // Initialize nullable fields
            $data['jam_keluar'] = null;
            $data['durasi'] = null;
            $data['tarif_dasar'] = 0;
            $data['diskon'] = 0;
            $data['total_bayar'] = 0;
            $data['metode_pembayaran'] = null;
            $data['tarif_id'] = null;

            $transaction = Transaction::create($data);

            DB::commit();

            return $transaction->load(['vehicle', 'area', 'vehicleType', 'user']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Process vehicle check-out with tariff calculation
     */
    public function checkOut(string $transactionId, array $data): Transaction
    {
        DB::beginTransaction();
        try {
            $transaction = Transaction::with(['vehicle', 'vehicleType'])
                ->where('id', $transactionId)
                ->where('status', Transaction::STATUS_IN)
                ->firstOrFail();

            // Set exit time
            $jamKeluar = now();

            // Calculate duration in minutes
            $durasi = $transaction->jam_masuk->diffInMinutes($jamKeluar);

            // Calculate tariff based on duration and vehicle type
            $tarif = $this->calculateTariff($durasi, $transaction->vehicle_type_id);

            if (!$tarif) {
                throw ValidationException::withMessages([
                    'tarif' => 'Tidak ada tarif yang sesuai untuk durasi ' . $durasi . ' menit dan tipe kendaraan ini.',
                ]);
            }

            // Check for member discount
            $diskon = $this->checkMemberDiscount($transaction->vehicle_id);

            // Calculate total payment
            $tarifDasar = $tarif->harga;
            $diskonAmount = ($tarifDasar * $diskon) / 100;
            $totalBayar = $tarifDasar - $diskonAmount;

            // Update transaction
            $transaction->update([
                'jam_keluar' => $jamKeluar,
                'durasi' => $durasi,
                'tarif_id' => $tarif->id,
                'tarif_dasar' => $tarifDasar,
                'diskon' => $diskon,
                'total_bayar' => $totalBayar,
                'metode_pembayaran' => $data['metode_pembayaran'],
                'payment_status' => Transaction::PAYMENT_STATUS_PAID,
                'status' => Transaction::STATUS_OUT,
            ]);

            DB::commit();

            return $transaction->fresh(['vehicle', 'area', 'vehicleType', 'tarif', 'user']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Calculate tariff based on duration and vehicle type
     */
    protected function calculateTariff(int $duration, string $vehicleTypeId): ?TarifParkir
    {
        return TarifParkir::where('vehicle_type_id', $vehicleTypeId)
            ->where('is_active', 1)
            ->where('durasi_min', '<=', $duration)
            ->where('durasi_max', '>=', $duration)
            ->first();
    }

    /**
     * Check if vehicle has active membership and return discount percentage
     */
    protected function checkMemberDiscount(string $vehicleId): float
    {
        $member = Member::where('vehicle_id', $vehicleId)
            ->active()
            ->first();

        return $member ? (float) $member->diskon : 0;
    }

    /**
     * Generate unique transaction code (format: TRX-YYYYMMDD-XXXX)
     */
    protected function generateTransactionCode(): string
    {
        $date = now()->format('Ymd');
        $prefix = "TRX-{$date}-";

        // Get the last transaction code for today
        $lastTransaction = Transaction::where('kode_transaksi', 'like', $prefix . '%')
            ->orderBy('kode_transaksi', 'desc')
            ->first();

        if ($lastTransaction) {
            // Extract the sequence number and increment
            $lastSequence = (int) substr($lastTransaction->kode_transaksi, -4);
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return $prefix . str_pad($newSequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get all active transactions (vehicles currently parked)
     */
    public function getActiveTransactions(int $perPage = 10, ?string $search = null): LengthAwarePaginator
    {
        $query = Transaction::with(['vehicle', 'area', 'vehicleType', 'user'])
            ->active()
            ->latest('jam_masuk');

        if ($search) {
            $query->whereHas('vehicle', function ($q) use ($search) {
                $q->where('plat_nomor', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Get transaction history with filters
     */
    public function getTransactionHistory(
        int $perPage = 10,
        ?string $search = null,
        ?string $startDate = null,
        ?string $endDate = null,
        ?int $status = null
    ): LengthAwarePaginator {
        $query = Transaction::with(['vehicle', 'area', 'vehicleType', 'tarif', 'user'])
            ->latest('jam_masuk');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_transaksi', 'like', "%{$search}%")
                    ->orWhereHas('vehicle', function ($q2) use ($search) {
                        $q2->where('plat_nomor', 'like', "%{$search}%");
                    });
            });
        }

        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }

        if ($status !== null) {
            $query->where('status', $status);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get transaction by ID with all relationships
     */
    public function getTransactionById(string $id): Transaction
    {
        return Transaction::with(['vehicle', 'area', 'vehicleType', 'tarif', 'user'])
            ->findOrFail($id);
    }

    /**
     * Get all active vehicles for check-in dropdown
     */
    public function getActiveVehicles(): Collection
    {
        return Vehicle::with('vehicleType')
            ->active()
            ->orderBy('plat_nomor')
            ->get();
    }

    /**
     * Get all parking areas with capacity information
     */
    public function getActiveParkingAreas(): Collection
    {
        $areas = AreaParkir::with('kapasitasArea.vehicleType')
            ->orderBy('nama_area')
            ->get();

        // Add current capacity for each area
        return $areas->map(function ($area) {
            $totalCapacity = $area->kapasitasArea->sum('kapasitas');
            $currentOccupied = Transaction::where('area_id', $area->id)
                ->where('status', Transaction::STATUS_IN)
                ->count();

            $area->total_capacity = $totalCapacity;
            $area->current_capacity = $totalCapacity - $currentOccupied;
            $area->occupied = $currentOccupied;

            return $area;
        });
    }

    /**
     * Get all vehicle types for dropdown
     */
    public function getActiveVehicleTypes(): Collection
    {
        return VehicleType::select('id', 'kode', 'nama_tipe')
            ->orderBy('nama_tipe')
            ->get();
    }

    /**
     * Check if vehicle already has an active transaction
     */
    public function hasActiveTransaction(string $vehicleId): bool
    {
        return Transaction::where('vehicle_id', $vehicleId)
            ->where('status', Transaction::STATUS_IN)
            ->exists();
    }

    /**
     * Cancel a transaction
     */
    public function cancelTransaction(string $transactionId): Transaction
    {
        DB::beginTransaction();
        try {
            $transaction = Transaction::where('id', $transactionId)
                ->where('status', Transaction::STATUS_IN)
                ->firstOrFail();

            $transaction->update([
                'status' => Transaction::STATUS_CANCELLED,
            ]);

            DB::commit();

            return $transaction->fresh(['vehicle', 'area', 'vehicleType', 'user']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get transaction statistics for dashboard
     */
    public function getTransactionStats(): array
    {
        $totalEntry = Transaction::where('status', Transaction::STATUS_IN)->count();
        $totalExitToday = Transaction::where('status', Transaction::STATUS_OUT)
            ->whereDate('jam_keluar', today())
            ->count();

        return [
            'total_entry' => $totalEntry,
            'total_exit_today' => $totalExitToday,
        ];
    }

    /**
     * Search transaction by plate number or transaction code
     */
    public function searchTransaction(string $search): ?Transaction
    {
        $transaction = Transaction::with(['vehicle.member', 'area', 'vehicleType', 'tarif', 'user'])
            ->where('status', Transaction::STATUS_IN)
            ->where(function ($q) use ($search) {
                $q->where('kode_transaksi', 'like', "%{$search}%")
                    ->orWhereHas('vehicle', function ($q2) use ($search) {
                        $q2->where('plat_nomor', 'like', "%{$search}%");
                    });
            })
            ->first();

        if ($transaction) {
            // Calculate current duration for preview
            $durasi = $transaction->jam_masuk->diffInMinutes(now());

            // Calculate estimated tariff
            $tarif = $this->calculateTariff($durasi, $transaction->vehicle_type_id);

            if ($tarif) {
                // Check for member discount
                $diskon = $this->checkMemberDiscount($transaction->vehicle_id);

                // Calculate estimated total
                $tarifDasar = $tarif->harga;
                $diskonAmount = ($tarifDasar * $diskon) / 100;
                $totalBayar = $tarifDasar - $diskonAmount;

                // Add estimated values to transaction (not saved to DB)
                $transaction->tarif_dasar = $tarifDasar;
                $transaction->diskon = $diskon;
                $transaction->total_bayar = $totalBayar;
                $transaction->durasi = $durasi;
            }
        }

        return $transaction;
    }
}
