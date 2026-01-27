<?php

namespace App\Modules\VehicleType\Services;

use App\Modules\Areaparkir\Models\VehicleType;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Service class untuk menangani business logic vehicle type management
 */
class VehicleTypeService
{
    /**
     * Get all vehicle types with pagination
     */
    public function getAllVehicleTypes(int $perPage = 10): LengthAwarePaginator
    {
        return VehicleType::latest()
            ->paginate($perPage);
    }

    /**
     * Get vehicle type by ID
     */
    public function getVehicleTypeById(string $id): VehicleType
    {
        return VehicleType::findOrFail($id);
    }

    /**
     * Create new vehicle type
     */
    public function createVehicleType(array $data): VehicleType
    {
        $data['id'] = Str::uuid();

        return VehicleType::create($data);
    }

    /**
     * Update existing vehicle type
     */
    public function updateVehicleType(VehicleType $vehicleType, array $data): VehicleType
    {
        $vehicleType->update($data);

        return $vehicleType->fresh();
    }

    /**
     * Delete vehicle type with validation
     */
    public function deleteVehicleType(VehicleType $vehicleType): void
    {
        // Check if vehicle type is used in any area
        $usageCount = $vehicleType->kapasitasArea()->count();

        if ($usageCount > 0) {
            throw ValidationException::withMessages([
                'vehicle_type' => "Cannot delete this vehicle type. It is currently used in {$usageCount} parking area(s).",
            ]);
        }

        $vehicleType->delete();
    }
}
