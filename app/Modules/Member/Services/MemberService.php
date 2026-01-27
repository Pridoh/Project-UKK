<?php

namespace App\Modules\Member\Services;

use App\Modules\Datavehicle\Models\Vehicle;
use App\Modules\Member\Models\Member;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

/**
 * Service class untuk menangani business logic member management
 */
class MemberService
{
    /**
     * Get all members with pagination and vehicle relationship
     */
    public function getAllMembers(int $perPage = 10, ?string $search = null): LengthAwarePaginator
    {
        $query = Member::with('vehicle.vehicleType');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhereHas('vehicle', function ($vq) use ($search) {
                        $vq->where('plat_nomor', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Get member by ID with relationships
     */
    public function getMemberById(string $id): Member
    {
        return Member::with('vehicle.vehicleType')->findOrFail($id);
    }

    /**
     * Get all vehicles for dropdown selection
     * Exclude vehicles that already have active memberships
     */
    public function getAvailableVehicles(?string $excludeMemberId = null): Collection
    {
        $activeVehicleIds = Member::active()
            ->when($excludeMemberId, function ($q) use ($excludeMemberId) {
                $q->where('id', '!=', $excludeMemberId);
            })
            ->pluck('vehicle_id');

        return Vehicle::select('id', 'plat_nomor', 'nama_pemilik', 'vehicle_type_id')
            ->with('vehicleType:id,nama_tipe')
            ->whereNotIn('id', $activeVehicleIds)
            ->orderBy('plat_nomor')
            ->get();
    }

    /**
     * Get all vehicles (for update, to show current vehicle)
     */
    /**
     * Get all vehicles with availability status
     */
    public function getAllVehicles(): Collection
    {
        $activeVehicleIds = Member::active()->pluck('vehicle_id')->toArray();

        return Vehicle::select('id', 'plat_nomor', 'nama_pemilik', 'vehicle_type_id')
            ->with('vehicleType:id,nama_tipe')
            ->orderBy('plat_nomor')
            ->get()
            ->map(function ($vehicle) use ($activeVehicleIds) {
                $vehicle->is_used = in_array($vehicle->id, $activeVehicleIds);
                return $vehicle;
            });
    }

    /**
     * Create new member
     * Auto-sets start_date to today and calculates end_date from package_duration
     */
    public function createMember(array $data): Member
    {
        $data['id'] = Str::uuid();

        // Auto-set start_date to today
        $data['start_date'] = now()->toDateString();

        // Calculate end_date from package_duration
        $endDate = now()->addMonths($data['package_duration'])->subDay();
        $data['end_date'] = $endDate->toDateString();

        return Member::create($data);
    }

    /**
     * Update existing member
     * Recalculates end_date if package_duration is changed
     */
    public function updateMember(Member $member, array $data): Member
    {
        // If package_duration is being updated, recalculate end_date
        if (isset($data['package_duration'])) {
            $startDate = Carbon::parse($member->start_date);
            $endDate = $startDate->copy()->addMonths($data['package_duration'])->subDay();
            $data['end_date'] = $endDate->toDateString();
        }

        $member->update($data);

        return $member->fresh(['vehicle.vehicleType']);
    }

    /**
     * Delete member with validation
     */
    public function deleteMember(Member $member): void
    {
        // TODO: Check if member is used in any transactions
        // For now, we'll just delete it
        // In the future, add validation like:
        // $usageCount = $member->transactions()->count();
        // if ($usageCount > 0) {
        //     throw ValidationException::withMessages([
        //         'member' => "Cannot delete this member. It is currently used in {$usageCount} transaction(s).",
        //     ]);
        // }

        $member->delete();
    }

    /**
     * Check if vehicle has valid membership on given date
     * Used during checkout for discount application
     */
    public function checkMembershipValidity(string $vehicleId, ?string $date = null): ?Member
    {
        $checkDate = $date ?? now()->toDateString();

        return Member::where('vehicle_id', $vehicleId)
            ->validOn($checkDate)
            ->first();
    }

    /**
     * Get human-readable label for member type
     */
    public function getMemberTypeLabel(int $type): string
    {
        return match ($type) {
            Member::TIPE_REGULAR => 'Regular',
            Member::TIPE_SILVER => 'Silver',
            Member::TIPE_GOLD => 'Gold',
            default => 'Unknown',
        };
    }

    /**
     * Validate membership dates don't overlap with existing membership for the same vehicle
     * 
     * @param string $startDate Start date of membership
     * @param string $endDate End date of membership
     * @param string $vehicleId Vehicle ID
     * @param string|null $excludeId Member ID to exclude from check (for updates)
     * @return bool
     */
    public function validateMembershipDates(string $startDate, string $endDate, string $vehicleId, ?string $excludeId = null): bool
    {
        $query = Member::where('vehicle_id', $vehicleId)
            ->where(function ($q) use ($startDate, $endDate) {
                // Check if new range overlaps with existing ranges
                $q->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q2) use ($startDate, $endDate) {
                        // Check if existing range contains new range
                        $q2->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->count() === 0;
    }

    /**
     * Get member types for dropdown
     */
    public function getMemberTypes(): array
    {
        return Member::getMemberTypes();
    }

    /**
     * Get membership packages for dropdown
     */
    public function getMemberPackages(): array
    {
        return config('member.packages', [
            1 => 'Monthly (1 Month)',
            3 => 'Quarterly (3 Months)',
            6 => 'Semi-Annual (6 Months)',
            12 => 'Yearly (1 Year)',
        ]);
    }
}
