<?php

namespace App\Modules\Tarifparkir\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Tarifparkir\Models\TarifParkir;
use App\Modules\Tarifparkir\Requests\StoreTarifParkirRequest;
use App\Modules\Tarifparkir\Requests\UpdateTarifParkirRequest;
use App\Modules\Tarifparkir\Services\TarifParkirService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menangani tarif parkir management
 * Thin controller yang hanya memanggil TarifParkirService
 */
class TarifParkirController extends Controller
{
    public function __construct(
        protected TarifParkirService $tarifParkirService
    ) {}

    /**
     * Display a listing of the parking tariffs.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->integer('per_page', 10);

        $tariffs = $this->tarifParkirService->getAllTariffs($perPage);
        $vehicleTypes = $this->tarifParkirService->getActiveVehicleTypes();

        return Inertia::render('tarifparkir/index', [
            'tariffs' => $tariffs,
            'vehicleTypes' => $vehicleTypes,
        ]);
    }

    /**
     * Store a newly created tariff in storage.
     */
    public function store(StoreTarifParkirRequest $request): RedirectResponse
    {
        $this->tarifParkirService->createTariff($request->validated());

        return redirect()->route('tarifparkir.index')
            ->with('success', 'Parking tariff created successfully');
    }

    /**
     * Update the specified tariff in storage.
     */
    public function update(UpdateTarifParkirRequest $request, TarifParkir $tarifparkir): RedirectResponse
    {
        $this->tarifParkirService->updateTariff($tarifparkir, $request->validated());

        return redirect()->route('tarifparkir.index')
            ->with('success', 'Parking tariff updated successfully');
    }

    /**
     * Remove the specified tariff from storage.
     */
    public function destroy(TarifParkir $tarifparkir): RedirectResponse
    {
        try {
            $this->tarifParkirService->deleteTariff($tarifparkir);

            return redirect()->route('tarifparkir.index')
                ->with('success', 'Parking tariff deleted successfully');
        } catch (ValidationException $e) {
            return redirect()->route('tarifparkir.index')
                ->with('error', $e->getMessage());
        }
    }
}
