<?php

namespace App\Modules\Areaparkir\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Areaparkir\Models\AreaParkir;
use App\Modules\Areaparkir\Requests\StoreAreaParkirRequest;
use App\Modules\Areaparkir\Requests\UpdateAreaParkirRequest;
use App\Modules\Areaparkir\Services\AreaParkirService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menangani area parkir management
 * Thin controller yang hanya memanggil AreaParkirService
 */
class AreaParkirController extends Controller
{
    public function __construct(
        protected AreaParkirService $areaParkirService
    ) {}

    /**
     * Display a listing of the parking areas.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->integer('per_page', 10);

        $areas = $this->areaParkirService->getAllAreas($perPage);
        $vehicleTypes = $this->areaParkirService->getAllVehicleTypes();

        return Inertia::render('areaparkir/index', [
            'areas' => $areas,
            'vehicleTypes' => $vehicleTypes,
        ]);
    }

    /**
     * Show the form for creating a new parking area.
     */
    public function create(): Response
    {
        $vehicleTypes = $this->areaParkirService->getAllVehicleTypes();

        return Inertia::render('areaparkir/create', [
            'vehicleTypes' => $vehicleTypes,
        ]);
    }

    /**
     * Store a newly created parking area in storage.
     */
    public function store(StoreAreaParkirRequest $request): RedirectResponse
    {
        $this->areaParkirService->createArea($request->validated());

        return redirect()->route('areaparkir.index')
            ->with('success', 'Parking area created successfully');
    }

    /**
     * Display the specified parking area.
     */
    public function show(AreaParkir $areaparkir): Response
    {
        $area = $this->areaParkirService->getAreaById($areaparkir->id);

        return Inertia::render('areaparkir/show', [
            'area' => $area,
        ]);
    }

    /**
     * Show the form for editing the specified parking area.
     */
    public function edit(AreaParkir $areaparkir): Response
    {
        $area = $this->areaParkirService->getAreaById($areaparkir->id);
        $vehicleTypes = $this->areaParkirService->getAllVehicleTypes();

        return Inertia::render('areaparkir/edit', [
            'area' => $area,
            'vehicleTypes' => $vehicleTypes,
        ]);
    }

    /**
     * Update the specified parking area in storage.
     */
    public function update(UpdateAreaParkirRequest $request, AreaParkir $areaparkir): RedirectResponse
    {
        $this->areaParkirService->updateArea($areaparkir, $request->validated());

        return redirect()->route('areaparkir.index')
            ->with('success', 'Parking area updated successfully');
    }

    /**
     * Remove the specified parking area from storage.
     */
    public function destroy(AreaParkir $areaparkir): RedirectResponse
    {
        $this->areaParkirService->deleteArea($areaparkir);

        return redirect()->route('areaparkir.index')
            ->with('success', 'Parking area deleted successfully');
    }
}
