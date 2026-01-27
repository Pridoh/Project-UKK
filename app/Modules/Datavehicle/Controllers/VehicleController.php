<?php

namespace App\Modules\Datavehicle\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Datavehicle\Models\Vehicle;
use App\Modules\Datavehicle\Requests\StoreVehicleRequest;
use App\Modules\Datavehicle\Requests\UpdateVehicleRequest;
use App\Modules\Datavehicle\Services\VehicleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menangani vehicle data management
 * Thin controller yang hanya memanggil VehicleService
 */
class VehicleController extends Controller
{
    public function __construct(
        protected VehicleService $vehicleService
    ) {}

    /**
     * Display a listing of the vehicles.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->input('search');

        $vehicles = $this->vehicleService->getAllVehicles($perPage, $search);
        $vehicleTypes = $this->vehicleService->getActiveVehicleTypes();

        return Inertia::render('datavehicle/index', [
            'vehicles' => $vehicles,
            'vehicleTypes' => $vehicleTypes,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created vehicle in storage.
     */
    public function store(StoreVehicleRequest $request): RedirectResponse
    {
        $this->vehicleService->createVehicle($request->validated());

        return redirect()->route('datavehicle.index')
            ->with('success', 'Vehicle data created successfully');
    }

    /**
     * Update the specified vehicle in storage.
     */
    public function update(UpdateVehicleRequest $request, Vehicle $datavehicle): RedirectResponse
    {
        $this->vehicleService->updateVehicle($datavehicle, $request->validated());

        return redirect()->route('datavehicle.index')
            ->with('success', 'Vehicle data updated successfully');
    }

    /**
     * Remove the specified vehicle from storage.
     */
    public function destroy(Vehicle $datavehicle): RedirectResponse
    {
        try {
            $this->vehicleService->deleteVehicle($datavehicle);

            return redirect()->route('datavehicle.index')
                ->with('success', 'Vehicle data deleted successfully');
        } catch (ValidationException $e) {
            return redirect()->route('datavehicle.index')
                ->with('error', $e->getMessage());
        }
    }
}
