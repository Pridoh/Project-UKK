import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

interface GaugeChartsProps {
    totalOccupancy?: number;
    revenueTarget?: number;
    memberSatisfaction?: number;
}

export function GaugeCharts({ totalOccupancy = 68.4, revenueTarget = 81.7, memberSatisfaction = 92.3 }: GaugeChartsProps) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check if dark mode is enabled
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        checkDarkMode();

        // Watch for theme changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    const createGaugeOptions = (value: number, label: string, color: string) => ({
        chart: {
            type: 'radialBar' as const,
            sparkline: {
                enabled: true,
            },
        },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                track: {
                    background: isDark ? '#374151' : '#e5e7eb',
                    strokeWidth: '97%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '14px',
                        fontWeight: 600,
                        color: isDark ? '#9ca3af' : '#6b7280',
                        offsetY: -10,
                    },
                    value: {
                        offsetY: -50,
                        fontSize: '28px',
                        fontWeight: 700,
                        color: isDark ? '#f3f4f6' : '#111827',
                        formatter: function (val: number) {
                            return val.toFixed(1) + '%';
                        },
                    },
                },
                hollow: {
                    margin: 0,
                    size: '70%',
                },
            },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: [color],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100],
            },
        },
        stroke: {
            lineCap: 'round' as const,
        },
        labels: [label],
    });

    const gauges = [
        {
            title: 'Okupansi Total',
            value: totalOccupancy,
            label: 'Terisi',
            color: '#3b82f6',
            description: 'Persentase slot parkir yang terisi',
        },
        {
            title: 'Target Pendapatan',
            value: revenueTarget,
            label: 'Tercapai',
            color: '#10b981',
            description: 'Pencapaian target pendapatan harian',
        },
        {
            title: 'Kepuasan Member',
            value: memberSatisfaction,
            label: 'Puas',
            color: '#8b5cf6',
            description: 'Tingkat kepuasan member parkir',
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Indikator Kinerja Real-Time</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                    {gauges.map((gauge, index) => (
                        <div key={index} className="space-y-2">
                            <div className="text-center">
                                <h3 className="mb-1 text-sm font-semibold">{gauge.title}</h3>
                                <Chart
                                    options={createGaugeOptions(gauge.value, gauge.label, gauge.color)}
                                    series={[gauge.value]}
                                    type="radialBar"
                                    height={200}
                                />
                                <p className="mt-2 text-xs text-muted-foreground">{gauge.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
