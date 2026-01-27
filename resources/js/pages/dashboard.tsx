import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { GaugeCharts } from '@/components/dashboard/gauge-charts';
import { RevenueCharts } from '@/components/dashboard/revenue-charts';
import { RevenueClock } from '@/components/dashboard/revenue-clock';
import { SlotTracking } from '@/components/dashboard/slot-tracking';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Statistics Cards */}
                <DashboardStats />

                {/* Clock and Gauge Charts Row */}
                <div className="grid gap-4 md:grid-cols-2">
                    <RevenueClock />
                    <GaugeCharts />
                </div>

                {/* Slot Tracking */}
                <SlotTracking />

                {/* Revenue Charts */}
                <RevenueCharts />
            </div>
        </AppLayout>
    );
}
