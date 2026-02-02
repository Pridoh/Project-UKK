import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

type ChartData = {
    categories: string[];
    series: number[];
};

interface RevenueChartsProps {
    weeklyData?: ChartData;
    monthlyData?: ChartData;
    yearlyData?: ChartData;
}

export function RevenueCharts({ weeklyData, monthlyData, yearlyData }: RevenueChartsProps) {
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

    // Use provided data or fallback to empty arrays
    const weekly = weeklyData || { categories: [], series: [] };
    const monthly = monthlyData || { categories: [], series: [] };
    const yearly = yearlyData || { categories: [], series: [] };

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
            categories: weekly.categories,
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
                    if (val >= 1000000) {
                        return 'Rp ' + (val / 1000000).toFixed(1) + 'jt';
                    }
                    if (val >= 1000) {
                        return 'Rp ' + (val / 1000).toFixed(0) + 'K';
                    }
                    return 'Rp ' + val;
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
            categories: monthly.categories,
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
                    if (val >= 1000000) {
                        return 'Rp ' + (val / 1000000).toFixed(1) + 'jt';
                    }
                    if (val >= 1000) {
                        return 'Rp ' + (val / 1000).toFixed(0) + 'K';
                    }
                    return 'Rp ' + val;
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
            categories: yearly.categories,
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
                    if (val >= 1000000) {
                        return 'Rp ' + (val / 1000000).toFixed(0) + 'jt';
                    }
                    if (val >= 1000) {
                        return 'Rp ' + (val / 1000).toFixed(0) + 'K';
                    }
                    return 'Rp ' + val;
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
                    <Chart options={weeklyOptions} series={[{ name: 'Pendapatan', data: weekly.series }]} type="line" height={300} />
                </CardContent>
            </Card>

            {/* Monthly Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Pendapatan Bulanan (Bulan Ini)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Chart options={monthlyOptions} series={[{ name: 'Pendapatan', data: monthly.series }]} type="bar" height={300} />
                </CardContent>
            </Card>

            {/* Yearly Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Pendapatan Tahunan (12 Bulan)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Chart options={yearlyOptions} series={[{ name: 'Pendapatan', data: yearly.series }]} type="area" height={300} />
                </CardContent>
            </Card>
        </div>
    );
}
