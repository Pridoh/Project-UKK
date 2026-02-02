import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Bike, Bus, Car, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface SlotTrackingProps {
    areas?: SlotTrackingArea[];
}

// Helper function to get icon based on vehicle type code
const getVehicleIcon = (code: string) => {
    const lowerCode = code.toLowerCase();
    if (lowerCode.includes('motor') || lowerCode === 'mtr') return Bike;
    if (lowerCode.includes('bus')) return Bus;
    if (lowerCode.includes('truck') || lowerCode.includes('truk')) return Truck;
    return Car; // Default to car
};

export function SlotTracking({ areas = [] }: SlotTrackingProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

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

    // Show message if no areas
    if (areas.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Tracking Slot Real-Time</CardTitle>
                        <div className="text-sm text-muted-foreground">Update: {currentTime.toLocaleTimeString('id-ID')}</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center text-muted-foreground">
                        <p>Belum ada data area parkir.</p>
                        <p className="text-sm">Silakan tambahkan area parkir terlebih dahulu.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

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
                                    <p className="text-sm text-muted-foreground">{area.kode_area}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {area.capacities.map((capacity, idx) => {
                                    const percentage = capacity.total > 0 ? (capacity.occupied / capacity.total) * 100 : 0;
                                    const alert = getAlert(percentage);
                                    const Icon = getVehicleIcon(capacity.vehicleTypeCode);

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
                                                        width: `${Math.min(percentage, 100)}%`,
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
