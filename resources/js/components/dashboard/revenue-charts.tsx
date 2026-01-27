import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

export function RevenueCharts() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        checkDarkMode();

        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    // Dummy data for weekly revenue (last 7 days)
    const weeklyData = {
        categories: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        series: [1800000, 2100000, 1950000, 2300000, 2450000, 3200000, 2900000],
    };

    // Dummy data for monthly revenue (current month)
    const monthlyData = {
        categories: Array.from({ length: 24 }, (_, i) => `${i + 1}`),
        series: [
            2100000, 1950000, 2300000, 2450000, 2200000, 2600000, 2800000, 2400000, 2150000, 2350000, 2500000, 2700000, 2900000, 3100000, 2850000,
            2650000, 2400000, 2550000, 2750000, 2950000, 3050000, 2800000, 2600000, 2450000,
        ],
    };

    // Dummy data for yearly revenue (12 months)
    const yearlyData = {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        series: [45000000, 52000000, 58000000, 61000000, 59000000, 63000000, 67000000, 71000000, 68000000, 72000000, 75000000, 73000000],
    };

    const textColor = isDark ? '#f3f4f6' : '#111827';
    const gridColor = isDark ? '#374151' : '#e5e7eb';

    const weeklyOptions = {
        chart: {
            type: 'line' as const,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false,
                },
            },
            background: 'transparent',
        },
        stroke: {
            curve: 'smooth' as const,
            width: 3,
        },
        colors: ['#3b82f6'],
        xaxis: {
            categories: weeklyData.categories,
            labels: {
                style: {
                    colors: textColor,
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: textColor,
                },
                formatter: function (val: number) {
                    return 'Rp ' + (val / 1000000).toFixed(1) + 'jt';
                },
            },
        },
        grid: {
            borderColor: gridColor,
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            y: {
                formatter: function (val: number) {
                    return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                    }).format(val);
                },
            },
        },
        markers: {
            size: 5,
            colors: ['#3b82f6'],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: {
                size: 7,
            },
        },
    };

    const monthlyOptions = {
        chart: {
            type: 'bar' as const,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false,
                },
            },
            background: 'transparent',
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                columnWidth: '60%',
            },
        },
        colors: ['#10b981'],
        xaxis: {
            categories: monthlyData.categories,
            labels: {
                style: {
                    colors: textColor,
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: textColor,
                },
                formatter: function (val: number) {
                    return 'Rp ' + (val / 1000000).toFixed(1) + 'jt';
                },
            },
        },
        grid: {
            borderColor: gridColor,
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            y: {
                formatter: function (val: number) {
                    return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                    }).format(val);
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
    };

    const yearlyOptions = {
        chart: {
            type: 'area' as const,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false,
                },
            },
            background: 'transparent',
        },
        stroke: {
            curve: 'smooth' as const,
            width: 2,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                stops: [0, 90, 100],
            },
        },
        colors: ['#8b5cf6'],
        xaxis: {
            categories: yearlyData.categories,
            labels: {
                style: {
                    colors: textColor,
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: textColor,
                },
                formatter: function (val: number) {
                    return 'Rp ' + (val / 1000000).toFixed(0) + 'jt';
                },
            },
        },
        grid: {
            borderColor: gridColor,
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            y: {
                formatter: function (val: number) {
                    return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                    }).format(val);
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
    };

    return (
        <div className="space-y-4">
            {/* Weekly Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Pendapatan Mingguan (7 Hari Terakhir)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Chart options={weeklyOptions} series={[{ name: 'Pendapatan', data: weeklyData.series }]} type="line" height={300} />
                </CardContent>
            </Card>

            {/* Monthly Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Pendapatan Bulanan (Bulan Ini)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Chart options={monthlyOptions} series={[{ name: 'Pendapatan', data: monthlyData.series }]} type="bar" height={300} />
                </CardContent>
            </Card>

            {/* Yearly Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Pendapatan Tahunan (12 Bulan)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Chart options={yearlyOptions} series={[{ name: 'Pendapatan', data: yearlyData.series }]} type="area" height={300} />
                </CardContent>
            </Card>
        </div>
    );
}
