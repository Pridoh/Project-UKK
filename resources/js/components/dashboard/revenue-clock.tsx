import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RevenueClockProps {
    dailyRevenue?: number;
    revenueGrowth?: number;
}

export function RevenueClock({ dailyRevenue = 2450000, revenueGrowth = 12.5 }: RevenueClockProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Waktu & Pendapatan Real-Time
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Clock Display */}
                <div className="space-y-2 text-center">
                    <div className="text-5xl font-bold tracking-tight tabular-nums">{formatTime(currentTime)}</div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{formatDate(currentTime)}</span>
                    </div>
                </div>

                {/* Revenue Display */}
                <div className="border-t pt-6">
                    <div className="space-y-2 text-center">
                        <p className="text-sm font-medium text-muted-foreground">Pendapatan Hari Ini</p>
                        <div className="text-4xl font-bold text-green-600 dark:text-green-400">{formatCurrency(dailyRevenue)}</div>
                        <div className="flex items-center justify-center gap-2">
                            <div
                                className={`flex items-center gap-1 text-sm font-medium ${
                                    revenueGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}
                            >
                                <span>
                                    {revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth)}%
                                </span>
                            </div>
                            <span className="text-sm text-muted-foreground">vs kemarin</span>
                        </div>
                    </div>
                </div>

                {/* Matikan untuk target harian */}
                {/* Additional Stats */}
                {/* <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Target Harian</p>
                        <p className="text-lg font-semibold">{formatCurrency(3000000)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Pencapaian</p>
                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{((dailyRevenue / 3000000) * 100).toFixed(1)}%</p>
                    </div>
                </div> */}
            </CardContent>
        </Card>
    );
}
