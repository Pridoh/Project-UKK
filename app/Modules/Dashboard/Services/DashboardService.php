<?php

namespace App\Modules\Dashboard\Services;

use App\Modules\Areaparkir\Models\AreaParkir;
use App\Modules\Areaparkir\Models\KapasitasArea;
use App\Modules\Member\Models\Member;
use App\Modules\Transaction\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Get dashboard statistics
     */
    public function getStats(): array
    {
        $today = Carbon::today();

        // Total capacity from all areas
        $totalSlots = KapasitasArea::sum('kapasitas');

        // Occupied slots (active transactions)
        $occupiedSlots = Transaction::where('status', Transaction::STATUS_IN)->count();

        // Daily revenue (completed transactions today)
        $dailyRevenue = Transaction::where('status', Transaction::STATUS_OUT)
            ->whereDate('jam_keluar', $today)
            ->sum('total_bayar');

        // Active transactions count
        $activeTransactions = $occupiedSlots;

        // Total active members
        $totalMembers = Member::where('end_date', '>=', $today->toDateString())->count();

        return [
            'totalSlots' => (int) $totalSlots,
            'occupiedSlots' => (int) $occupiedSlots,
            'dailyRevenue' => (int) $dailyRevenue,
            'activeTransactions' => (int) $activeTransactions,
            'totalMembers' => (int) $totalMembers,
        ];
    }

    /**
     * Get daily revenue with growth percentage vs yesterday
     */
    public function getDailyRevenueData(): array
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $todayRevenue = Transaction::where('status', Transaction::STATUS_OUT)
            ->whereDate('jam_keluar', $today)
            ->sum('total_bayar');

        $yesterdayRevenue = Transaction::where('status', Transaction::STATUS_OUT)
            ->whereDate('jam_keluar', $yesterday)
            ->sum('total_bayar');

        // Calculate growth percentage
        $growth = 0;
        if ($yesterdayRevenue > 0) {
            $growth = (($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100;
        } elseif ($todayRevenue > 0) {
            $growth = 100; // If yesterday was 0 and today has revenue, 100% growth
        }

        return [
            'dailyRevenue' => (int) $todayRevenue,
            'revenueGrowth' => round($growth, 1),
        ];
    }

    /**
     * Get slot tracking data per area with vehicle type breakdown
     */
    public function getSlotTracking(): array
    {
        // Get all areas with their capacities and vehicle types
        $areas = AreaParkir::with(['kapasitasArea.vehicleType'])->get();

        $result = [];

        foreach ($areas as $area) {
            $areaData = [
                'id' => $area->id,
                'name' => $area->nama_area,
                'kode_area' => $area->kode_area,
                'capacities' => [],
            ];

            foreach ($area->kapasitasArea as $kapasitas) {
                if (!$kapasitas->vehicleType) {
                    continue;
                }

                // Count occupied slots for this area and vehicle type
                $occupied = Transaction::where('status', Transaction::STATUS_IN)
                    ->where('area_id', $area->id)
                    ->where('vehicle_type_id', $kapasitas->vehicle_type_id)
                    ->count();

                $areaData['capacities'][] = [
                    'vehicleType' => $kapasitas->vehicleType->nama_tipe,
                    'vehicleTypeCode' => $kapasitas->vehicleType->kode,
                    'total' => (int) $kapasitas->kapasitas,
                    'occupied' => (int) $occupied,
                ];
            }

            // Only add area if it has capacities
            if (!empty($areaData['capacities'])) {
                $result[] = $areaData;
            }
        }

        return $result;
    }

    /**
     * Get revenue chart data (weekly, monthly, yearly)
     */
    public function getRevenueCharts(): array
    {
        return [
            'weekly' => $this->getWeeklyRevenue(),
            'monthly' => $this->getMonthlyRevenue(),
            'yearly' => $this->getYearlyRevenue(),
        ];
    }

    /**
     * Get weekly revenue (last 7 days)
     */
    private function getWeeklyRevenue(): array
    {
        $days = [];
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $revenue = Transaction::where('status', Transaction::STATUS_OUT)
                ->whereDate('jam_keluar', $date)
                ->sum('total_bayar');

            $days[] = [
                'label' => $dayNames[$date->dayOfWeek],
                'date' => $date->format('Y-m-d'),
                'value' => (int) $revenue,
            ];
        }

        return [
            'categories' => array_column($days, 'label'),
            'series' => array_column($days, 'value'),
        ];
    }

    /**
     * Get monthly revenue (current month, grouped by day)
     */
    private function getMonthlyRevenue(): array
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $today = Carbon::today();
        $daysInMonth = $today->day;

        $days = [];

        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = $startOfMonth->copy()->addDays($i - 1);
            $revenue = Transaction::where('status', Transaction::STATUS_OUT)
                ->whereDate('jam_keluar', $date)
                ->sum('total_bayar');

            $days[] = [
                'label' => (string) $i,
                'value' => (int) $revenue,
            ];
        }

        return [
            'categories' => array_column($days, 'label'),
            'series' => array_column($days, 'value'),
        ];
    }

    /**
     * Get yearly revenue (last 12 months)
     */
    private function getYearlyRevenue(): array
    {
        $months = [];
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            $revenue = Transaction::where('status', Transaction::STATUS_OUT)
                ->whereBetween('jam_keluar', [$startOfMonth, $endOfMonth])
                ->sum('total_bayar');

            $months[] = [
                'label' => $monthNames[$date->month - 1],
                'value' => (int) $revenue,
            ];
        }

        return [
            'categories' => array_column($months, 'label'),
            'series' => array_column($months, 'value'),
        ];
    }

    /**
     * Get all dashboard data in one call
     */
    public function getAllDashboardData(): array
    {
        return [
            'stats' => $this->getStats(),
            'revenue' => $this->getDailyRevenueData(),
            'slotTracking' => $this->getSlotTracking(),
            'charts' => $this->getRevenueCharts(),
        ];
    }
}
