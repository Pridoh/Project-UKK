import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Car, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AreaOccupancy {
    id: string;
    name: string;
    location: string;
    capacities: {
        vehicleType: string;
        icon: typeof Car;
        total: number;
        occupied: number;
        color: string;
    }[];
}

export function SlotTracking() {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Dummy data for parking areas
    const areas: AreaOccupancy[] = [
        {
            id: '1',
            name: 'Basement 1',
            location: 'Lantai B1',
            capacities: [
                {
                    vehicleType: 'Mobil',
                    icon: Car,
                    total: 150,
                    occupied: 135,
                    color: 'bg-red-500',
                },
                {
                    vehicleType: 'Motor',
                    icon: Car,
                    total: 50,
                    occupied: 38,
                    color: 'bg-yellow-500',
                },
            ],
        },
        {
            id: '2',
            name: 'Basement 2',
            location: 'Lantai B2',
            capacities: [
                {
                    vehicleType: 'Mobil',
                    icon: Car,
                    total: 120,
                    occupied: 85,
                    color: 'bg-yellow-500',
                },
                {
                    vehicleType: 'Motor',
                    icon: Car,
                    total: 40,
                    occupied: 22,
                    color: 'bg-green-500',
                },
            ],
        },
        {
            id: '3',
            name: 'Outdoor Area',
            location: 'Area Terbuka',
            capacities: [
                {
                    vehicleType: 'Mobil',
                    icon: Car,
                    total: 80,
                    occupied: 45,
                    color: 'bg-green-500',
                },
                {
                    vehicleType: 'Bus',
                    icon: Truck,
                    total: 10,
                    occupied: 7,
                    color: 'bg-yellow-500',
                },
            ],
        },
        {
            id: '4',
            name: 'Roof Top',
            location: 'Lantai Atap',
            capacities: [
                {
                    vehicleType: 'Motor',
                    icon: Car,
                    total: 100,
                    occupied: 48,
                    color: 'bg-green-500',
                },
            ],
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getOccupancyColor = (percentage: number) => {
        if (percentage >= 95) return 'text-red-600 dark:text-red-400';
        if (percentage >= 90) return 'text-orange-600 dark:text-orange-400';
        if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 95) return 'bg-red-500';
        if (percentage >= 90) return 'bg-orange-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getAlert = (percentage: number) => {
        if (percentage >= 100) return { show: true, message: 'PENUH!', color: 'text-red-600' };
        if (percentage >= 90)
            return {
                show: true,
                message: 'Hampir Penuh',
                color: 'text-orange-600',
            };
        return { show: false, message: '', color: '' };
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Tracking Slot Real-Time</CardTitle>
                    <div className="text-sm text-muted-foreground">Update: {currentTime.toLocaleTimeString('id-ID')}</div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {areas.map((area) => (
                        <div key={area.id} className="space-y-3 rounded-lg border p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{area.name}</h3>
                                    <p className="text-sm text-muted-foreground">{area.location}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {area.capacities.map((capacity, idx) => {
                                    const percentage = (capacity.occupied / capacity.total) * 100;
                                    const alert = getAlert(percentage);
                                    const Icon = capacity.icon;

                                    return (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    <span className="font-medium">{capacity.vehicleType}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {alert.show && (
                                                        <div className={`flex items-center gap-1 ${alert.color}`}>
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span className="text-xs font-semibold">{alert.message}</span>
                                                        </div>
                                                    )}
                                                    <span className={`font-semibold ${getOccupancyColor(percentage)}`}>
                                                        {capacity.occupied}/{capacity.total}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        ({percentage.toFixed(0)}
                                                        %)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <Progress value={percentage} className="h-2" />
                                                <div
                                                    className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(percentage)}`}
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
