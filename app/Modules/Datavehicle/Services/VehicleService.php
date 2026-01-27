<?php

namespace App\Modules\Datavehicle\Services;

use App\Modules\Areaparkir\Models\VehicleType;
use App\Modules\Datavehicle\Models\Vehicle;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Service class untuk menangani business logic vehicle management
 */
class VehicleService
{
    /**
     * Get all vehicles with pagination and search
     */
    public function getAllVehicles(int $perPage = 10, ?string $search = null): LengthAwarePaginator
    {
        $query = Vehicle::with('vehicleType');

        if ($search) {
            $query->where('plat_nomor', 'like', "%{$search}%")
                ->orWhere('nama_pemilik', 'like', "%{$search}%");
        }

        return $query->latest()
            ->paginate($perPage);
    }

    /**
     * Get vehicle by ID with relationships
     */
    public function getVehicleById(string $id): Vehicle
    {
        return Vehicle::with('vehicleType')->findOrFail($id);
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
     * Create new vehicle
     */
    public function createVehicle(array $data): Vehicle
    {
        $data['id'] = Str::uuid();

        return Vehicle::create($data);
    }

    /**
     * Update existing vehicle
     */
    public function updateVehicle(Vehicle $vehicle, array $data): Vehicle
    {
        $vehicle->update($data);

        return $vehicle->fresh(['vehicleType']);
    }

    /**
     * Delete vehicle with validation
     */
    public function deleteVehicle(Vehicle $vehicle): void
    {
        // TODO: Check if vehicle is used in any active transactions
        // For now, we'll just delete it
        // In the future, add validation like:
        // $usageCount = $vehicle->transactions()->whereNull('jam_keluar')->count();
        // if ($usageCount > 0) {
        //     throw ValidationException::withMessages([
        //         'vehicle' => "Cannot delete this vehicle. It is currently parked in the parking area.",
        //     ]);
        // }

        $vehicle->delete();
    }
}
