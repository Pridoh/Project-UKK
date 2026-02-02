import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RevenueCharts } from '@/components/dashboard/revenue-charts';
import { RevenueClock } from '@/components/dashboard/revenue-clock';
import { SlotTracking } from '@/components/dashboard/slot-tracking';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Polling interval in milliseconds (10 seconds)
const POLLING_INTERVAL = 10000;

type StatsData = {
    totalSlots: number;
    occupiedSlots: number;
    dailyRevenue: number;
    activeTransactions: number;
    totalMembers: number;
};

type RevenueData = {
    dailyRevenue: number;
    revenueGrowth: number;
};

type AreaCapacity = {
    vehicleType: string;
    vehicleTypeCode: string;
    total: number;
    occupied: number;
};

type SlotTrackingArea = {
    id: string;
    name: string;
    kode_area: string;
    capacities: AreaCapacity[];
};

type ChartData = {
    categories: string[];
    series: number[];
};

type ChartsData = {
    weekly: ChartData;
    monthly: ChartData;
    yearly: ChartData;
};

type Props = {
    stats: StatsData;
    revenue: RevenueData;
    slotTracking: SlotTrackingArea[];
    charts: ChartsData;
};

export default function Dashboard({ stats, revenue, slotTracking, charts }: Props) {
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Start polling for real-time updates
        pollingRef.current = setInterval(() => {
            // Reload only specific props without full page reload
            router.reload({
                only: ['stats', 'revenue', 'slotTracking'],
                preserveScroll: true,
                preserveState: true,
            });
        }, POLLING_INTERVAL);

        // Cleanup on unmount
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Statistics Cards */}
                <DashboardStats
                    totalSlots={stats.totalSlots}
                    occupiedSlots={stats.occupiedSlots}
                    dailyRevenue={stats.dailyRevenue}
                    activeTransactions={stats.activeTransactions}
                    totalMembers={stats.totalMembers}
                />

                {/* Clock and Gauge Charts Row */}
                <div className="grid gap-4">
                    <RevenueClock dailyRevenue={revenue.dailyRevenue} revenueGrowth={revenue.revenueGrowth} />
                    {/* Matikan Untuk Chart ini */}
                    {/* <GaugeCharts /> */}
                </div>

                {/* Slot Tracking */}
                <SlotTracking areas={slotTracking} />

                {/* Revenue Charts */}
                <RevenueCharts weeklyData={charts.weekly} monthlyData={charts.monthly} yearlyData={charts.yearly} />
            </div>
        </AppLayout>
    );
}
