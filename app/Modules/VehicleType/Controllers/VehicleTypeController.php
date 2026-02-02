<?php

namespace App\Modules\VehicleType\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Areaparkir\Models\VehicleType;
use App\Modules\VehicleType\Requests\StoreVehicleTypeRequest;
use App\Modules\VehicleType\Requests\UpdateVehicleTypeRequest;
use App\Modules\VehicleType\Services\VehicleTypeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menangani vehicle type management
 * Thin controller yang hanya memanggil VehicleTypeService
 */
class VehicleTypeController extends Controller
{
    public function __construct(
        protected VehicleTypeService $vehicleTypeService
    ) {}

    /**
     * Display a listing of the vehicle types.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->input('search');

        $vehicleTypes = $this->vehicleTypeService->getAllVehicleTypes($perPage, $search);

        return Inertia::render('vehicletype/index', [
            'vehicleTypes' => $vehicleTypes,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created vehicle type in storage.
     */
    public function store(StoreVehicleTypeRequest $request): RedirectResponse
    {
        $this->vehicleTypeService->createVehicleType($request->validated());

        return redirect()->route('vehicletype.index')
            ->with('success', 'Vehicle type created successfully');
    }

    /**
     * Update the specified vehicle type in storage.
     */
    public function update(UpdateVehicleTypeRequest $request, VehicleType $vehicletype): RedirectResponse
    {
        $this->vehicleTypeService->updateVehicleType($vehicletype, $request->validated());

        return redirect()->route('vehicletype.index')
            ->with('success', 'Vehicle type updated successfully');
    }

    /**
     * Remove the specified vehicle type from storage.
     */
    public function destroy(VehicleType $vehicletype): RedirectResponse
    {
        try {
            $this->vehicleTypeService->deleteVehicleType($vehicletype);

            return redirect()->route('vehicletype.index')
                ->with('success', 'Vehicle type deleted successfully');
        } catch (ValidationException $e) {
            return redirect()->route('vehicletype.index')
                ->with('error', $e->getMessage());
        }
    }
}
