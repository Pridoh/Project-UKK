<?php

namespace App\Modules\Tarifparkir\Services;

use App\Modules\Areaparkir\Models\VehicleType;
use App\Modules\Tarifparkir\Models\TarifParkir;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Service class untuk menangani business logic tarif parkir management
 */
class TarifParkirService
{
    /**
     * Get all tariffs with pagination and vehicle type relationship
     */
    public function getAllTariffs(int $perPage = 10): LengthAwarePaginator
    {
        return TarifParkir::with('vehicleType')
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get tariff by ID with relationships
     */
    public function getTariffById(string $id): TarifParkir
    {
        return TarifParkir::with('vehicleType')->findOrFail($id);
    }

    /**
     * Get all active vehicle types for dropdown
     */
    public function getActiveVehicleTypes(): Collection
    {
        return VehicleType::select('id', 'kode', 'nama_tipe')
            ->orderBy('nama_tipe')
            ->get();
    }

    /**
     * Create new tariff
     */
    public function createTariff(array $data): TarifParkir
    {
        $data['id'] = Str::uuid();

        return TarifParkir::create($data);
    }

    /**
     * Update existing tariff
     */
    public function updateTariff(TarifParkir $tariff, array $data): TarifParkir
    {
        $tariff->update($data);

        return $tariff->fresh(['vehicleType']);
    }

    /**
     * Delete tariff with validation
     */
    public function deleteTariff(TarifParkir $tariff): void
    {
        // TODO: Check if tariff is used in any transactions
        // For now, we'll just delete it
        // In the future, add validation like:
        // $usageCount = $tariff->transactions()->count();
        // if ($usageCount > 0) {
        //     throw ValidationException::withMessages([
        //         'tariff' => "Cannot delete this tariff. It is currently used in {$usageCount} transaction(s).",
        //     ]);
        // }

        $tariff->delete();
    }

    /**
     * Validate duration range doesn't overlap with existing tariffs for the same vehicle type
     * 
     * @param int $durasiMin Minimum duration in minutes
     * @param int $durasiMax Maximum duration in minutes
     * @param string $vehicleTypeId Vehicle type ID
     * @param string|null $excludeId Tariff ID to exclude from check (for updates)
     * @return bool
     */
    public function validateDurationRange(int $durasiMin, int $durasiMax, string $vehicleTypeId, ?string $excludeId = null): bool
    {
        $query = TarifParkir::where('vehicle_type_id', $vehicleTypeId)
            ->where(function ($q) use ($durasiMin, $durasiMax) {
                // Check if new range overlaps with existing ranges
                $q->whereBetween('durasi_min', [$durasiMin, $durasiMax])
                    ->orWhereBetween('durasi_max', [$durasiMin, $durasiMax])
                    ->orWhere(function ($q2) use ($durasiMin, $durasiMax) {
                        // Check if existing range contains new range
                        $q2->where('durasi_min', '<=', $durasiMin)
                            ->where('durasi_max', '>=', $durasiMax);
                    });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->count() === 0;
    }
}
