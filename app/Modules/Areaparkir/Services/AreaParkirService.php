<?php

namespace App\Modules\Areaparkir\Services;

use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Modules\Areaparkir\Models\AreaParkir;
use App\Modules\Areaparkir\Models\VehicleType;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Modules\Areaparkir\Models\KapasitasArea;

/**
 * Service class untuk menangani business logic area parkir management
 */
class AreaParkirService
{
    /**
     * Get all parking areas with pagination and relationships
     */
    public function getAllAreas(int $perPage = 10): LengthAwarePaginator
    {
        return AreaParkir::with(['kapasitasArea.vehicleType'])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get parking area by ID with relationships
     */
    public function getAreaById(string $id): AreaParkir
    {
        return AreaParkir::with(['kapasitasArea.vehicleType'])->findOrFail($id);
    }

    /**
     * Get all vehicle types for dropdown
     */
    public function getAllVehicleTypes(): Collection
    {
        return VehicleType::orderBy('nama_tipe')->get(['id', 'kode', 'nama_tipe']);
    }

    /**
     * Create new parking area with capacity records
     */
    public function createArea(array $data): AreaParkir
    {
        return DB::transaction(function () use ($data) {
            $areaId = Str::uuid();

            // Handle file upload
            $filename = null;
            if (isset($data['lokasi']) && $data['lokasi'] instanceof UploadedFile) {
                $file = $data['lokasi'];
                $filename = $data['kode_area'] . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file->storeAs('area-photos', $filename, 'public');
            }

            // Create area record
            $area = AreaParkir::create([
                'id' => $areaId,
                'kode_area' => $data['kode_area'],
                'nama_area' => $data['nama_area'],
                'lokasi' => $filename,
            ]);

            // Create capacity records
            if (isset($data['kapasitas']) && is_array($data['kapasitas'])) {
                foreach ($data['kapasitas'] as $kapasitas) {
                    KapasitasArea::create([
                        'id' => Str::uuid(),
                        'area_id' => $areaId,
                        'vehicle_type_id' => $kapasitas['vehicle_type_id'],
                        'kapasitas' => $kapasitas['kapasitas'],
                    ]);
                }
            }

            // Return area with relationships
            return $area->load(['kapasitasArea.vehicleType']);
        });
    }

    /**
     * Update existing parking area
     */
    public function updateArea(AreaParkir $area, array $data): AreaParkir
    {
        return DB::transaction(function () use ($area, $data) {
            $updateData = [
                'kode_area' => $data['kode_area'],
                'nama_area' => $data['nama_area'],
            ];

            // Handle file upload
            if (isset($data['lokasi']) && $data['lokasi'] instanceof UploadedFile) {
                // Delete old photo if exists
                if ($area->lokasi && Storage::disk('public')->exists('area-photos/' . $area->lokasi)) {
                    Storage::disk('public')->delete('area-photos/' . $area->lokasi);
                }

                // Store new photo
                $file = $data['lokasi'];
                $filename = $data['kode_area'] . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file->storeAs('area-photos', $filename, 'public');
                $updateData['lokasi'] = $filename;
            }

            // Update area basic info
            $area->update($updateData);

            // Delete existing capacity records
            KapasitasArea::where('area_id', $area->id)->delete();

            // Create new capacity records
            if (isset($data['kapasitas']) && is_array($data['kapasitas'])) {
                foreach ($data['kapasitas'] as $kapasitas) {
                    KapasitasArea::create([
                        'id' => Str::uuid(),
                        'area_id' => $area->id,
                        'vehicle_type_id' => $kapasitas['vehicle_type_id'],
                        'kapasitas' => $kapasitas['kapasitas'],
                    ]);
                }
            }

            // Return updated area with relationships
            return $area->fresh(['kapasitasArea.vehicleType']);
        });
    }

    /**
     * Delete parking area (soft delete)
     */
    public function deleteArea(AreaParkir $area): void
    {
        DB::transaction(function () use ($area) {
            // Delete photo if exists
            if ($area->lokasi && Storage::disk('public')->exists('area-photos/' . $area->lokasi)) {
                Storage::disk('public')->delete('area-photos/' . $area->lokasi);
            }

            // Delete capacity records first
            KapasitasArea::where('area_id', $area->id)->delete();

            // Soft delete area
            $area->delete();
        });
    }
}
