import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, DollarSign, ParkingCircle, TrendingUp, Users } from 'lucide-react';

interface DashboardStatsProps {
    totalSlots?: number;
    occupiedSlots?: number;
    dailyRevenue?: number;
    activeTransactions?: number;
    totalMembers?: number;
}

export function DashboardStats({
    totalSlots = 500,
    occupiedSlots = 342,
    dailyRevenue = 2450000,
    activeTransactions = 87,
    totalMembers = 156,
}: DashboardStatsProps) {
    const occupancyRate = ((occupiedSlots / totalSlots) * 100).toFixed(1);
    const availableSlots = totalSlots - occupiedSlots;

    const stats = [
        {
            title: 'Total Kapasitas',
            value: totalSlots.toLocaleString('id-ID'),
            subtitle: `${availableSlots} slot tersedia`,
            icon: ParkingCircle,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-950',
        },
        {
            title: 'Tingkat Okupansi',
            value: `${occupancyRate}%`,
            subtitle: `${occupiedSlots} kendaraan parkir`,
            icon: Car,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-950',
        },
        {
            title: 'Pendapatan Hari Ini',
            value: `Rp ${(dailyRevenue / 1000).toFixed(0)}K`,
            subtitle: `${activeTransactions} transaksi`,
            icon: DollarSign,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-100 dark:bg-emerald-950',
        },
        {
            title: 'Transaksi Aktif',
            value: activeTransactions.toString(),
            subtitle: 'Kendaraan sedang parkir',
            icon: TrendingUp,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-950',
        },
        {
            title: 'Total Member',
            value: totalMembers.toString(),
            subtitle: 'Member terdaftar',
            icon: Users,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-950',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
