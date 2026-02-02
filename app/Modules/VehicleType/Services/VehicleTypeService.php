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
    public function getAllVehicleTypes(int $perPage = 10, ?string $search = null): LengthAwarePaginator
    {
        $query = VehicleType::latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_tipe', 'like', "%{$search}%")
                    ->orWhere('kode', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Get vehicle type by ID
     */
    public function getVehicleTypeById(string $id): VehicleType
    {
        return VehicleType::findOrFail($id);
    }

    /**
     * Generate vehicle type code based on name and slot size
     * Examples: Mobil=MBL, Motor=MTR, Bus=BUS, Truk=TRK
     */
    private function generateVehicleTypeCode(string $namaTipe, int $ukuranSlot): string
    {
        // Predefined abbreviations for common vehicle types
        $abbreviations = [
            'mobil' => 'MBL',
            'motor' => 'MTR',
            'bus' => 'BUS',
            'truk' => 'TRK',
            'sepeda' => 'SPD',
            'becak' => 'BCK',
            'pickup' => 'PCK',
            'van' => 'VAN',
        ];

        $namaTipeLower = strtolower(trim($namaTipe));

        // Check if we have a predefined abbreviation
        $prefix = $abbreviations[$namaTipeLower] ?? null;

        // If no predefined abbreviation, generate from first 3 letters
        if (!$prefix) {
            $prefix = strtoupper(substr($namaTipeLower, 0, 3));
        }

        return "{$prefix}-{$ukuranSlot}";
    }

    /**
     * Create new vehicle type
     */
    public function createVehicleType(array $data): VehicleType
    {
        $data['id'] = Str::uuid();
        // $data['kode'] = $this->generateVehicleTypeCode($data['nama_tipe'], $data['ukuran_slot']);

        return VehicleType::create($data);
    }

    /**
     * Update existing vehicle type
     */
    public function updateVehicleType(VehicleType $vehicleType, array $data): VehicleType
    {
        // $data['kode'] = $this->generateVehicleTypeCode($data['nama_tipe'], $data['ukuran_slot']);
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
