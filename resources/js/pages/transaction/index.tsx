import { NotificationDialog } from '@/components/notification-dialog';
import { ReceiptModal } from '@/components/receipt-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowDownToLine, ArrowUpFromLine, Camera, Car, Printer, QrCode, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { QrScanner } from '@/components/qr-scanner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaction',
        href: '#',
    },
    {
        title: 'Live Transaction',
        href: '/transaction',
    },
];

type VehicleType = {
    id: string;
    kode: string;
    nama_tipe: string;
};

type Vehicle = {
    id: string;
    plat_nomor: string;
    nama_pemilik: string | null;
    vehicle_type_id: string;
    vehicle_type: VehicleType;
};

type AreaParkir = {
    id: string;
    nama_area: string;
    total_capacity: number;
    current_capacity: number;
    occupied: number;
    kapasitas_area?: Array<{
        id: string;
        vehicle_type_id: string;
        kapasitas: number;
    }>;
};

type Member = {
    id: string;
    member_id: string;
    nama: string;
    tipe_member: number;
    diskon: string;
    end_date: string;
};

type Transaction = {
    id: string;
    kode_transaksi: string;
    vehicle_id: string;
    area_id: string;
    vehicle_type_id: string;
    tarif_id: string | null;
    jam_masuk: string;
    jam_keluar: string | null;
    durasi: number | null;
    tarif_dasar: number;
    diskon: number;
    total_bayar: number;
    metode_pembayaran: number | null;
    status: number;
    vehicle: Vehicle & { member?: Member };
    area: AreaParkir;
    vehicle_type: VehicleType;
    formatted_total_bayar: string;
    duration_formatted: string;
};

type PaymentMethods = {
    [key: number]: string;
};

type Stats = {
    total_entry: number;
    total_exit_today: number;
};

type Props = {
    vehicles: Vehicle[];
    areas: AreaParkir[];
    vehicleTypes: VehicleType[];
    paymentMethods: PaymentMethods;
    stats: Stats;
    activeTransactions?: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

type FlashMessages = {
    success?: string;
    error?: string;
};

export default function LiveTransaction({ vehicles, areas, vehicleTypes, paymentMethods, stats, activeTransactions }: Props) {
    const { flash } = usePage<SharedData>().props;
    const flashMessages = flash as FlashMessages;
    const [showErrorDialog, setShowErrorDialog] = useState(false);

    // Receipt modal state
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
    const [receiptType, setReceiptType] = useState<'checkin' | 'checkout'>('checkin');

    // QR Scanner state
    const [showQrScanner, setShowQrScanner] = useState(false);

    // Check for transaction in flash (from successful check-in/check-out)
    useEffect(() => {
        const transaction = (flash as any)?.transaction;
        if (transaction) {
            setReceiptTransaction(transaction);
            setReceiptType(transaction.jam_keluar ? 'checkout' : 'checkin');
            setShowReceipt(true);
        }

        // Show success toast / error dialog
        if (flashMessages?.success) {
            toast.success(flashMessages.success);
        }
        if (flashMessages?.error) {
            setShowErrorDialog(true);
        }
    }, [flash, flashMessages]); // Include both dependencies

    // Handle receipt modal close - reset forms after user closes receipt
    const handleReceiptClose = (open: boolean) => {
        setShowReceipt(open);
        if (!open) {
            // Reset forms when receipt is closed
            if (receiptType === 'checkin') {
                checkInForm.reset();
                setCheckInMode('existing');
            } else {
                setSearchedTransaction(null);
                setSearchTerm('');
                checkOutForm.reset();
            }
        }
    };

    // Check-in form - support both existing and new vehicles
    const [checkInMode, setCheckInMode] = useState<'existing' | 'new'>('existing');
    const checkInForm = useForm({
        vehicle_id: '',
        plat_nomor: '',
        nama_pemilik: '',
        area_id: '',
        vehicle_type_id: '',
    });

    // Check-out form
    const [searchTerm, setSearchTerm] = useState('');
    const [searchedTransaction, setSearchedTransaction] = useState<Transaction | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const checkOutForm = useForm({
        transaction_id: '',
        metode_pembayaran: 1,
    });

    // Get vehicle type from selected vehicle
    const selectedVehicle = vehicles.find((v) => v.id === checkInForm.data.vehicle_id);

    // Filter areas based on selected vehicle type
    const selectedVehicleTypeId = checkInForm.data.vehicle_type_id;
    const filteredAreas = selectedVehicleTypeId
        ? areas.filter((area) => {
              // Check if area has capacity for this vehicle type
              const hasCapacity = area.kapasitas_area?.some(
                  (kapasitas) => kapasitas.vehicle_type_id === selectedVehicleTypeId && kapasitas.kapasitas > 0,
              );
              return hasCapacity && area.current_capacity > 0;
          })
        : areas.filter((area) => area.current_capacity > 0);

    // Handle vehicle selection - auto-fill vehicle type if vehicle has history
    const handleVehicleSelect = (vehicleId: string) => {
        checkInForm.setData('vehicle_id', vehicleId);
        const vehicle = vehicles.find((v) => v.id === vehicleId);
        if (vehicle) {
            checkInForm.setData('vehicle_type_id', vehicle.vehicle_type_id);
        }
    };

    // Handle mode switch
    const handleModeChange = (mode: 'existing' | 'new') => {
        setCheckInMode(mode);
        // Reset form when switching modes
        checkInForm.reset();
    };

    // Handle check-in submit
    const handleCheckIn = (e: React.FormEvent) => {
        e.preventDefault();
        checkInForm.post(route('transaction.checkin'), {
            preserveScroll: true,
            // Don't reset form here - let user close receipt modal first
        });
    };

    // Handle search transaction for check-out - search by transaction code or plate number
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setIsSearching(true);

        try {
            const response = await fetch(route('transaction.search', { search: searchTerm.trim() }));
            const data = await response.json();

            if (data.transaction) {
                setSearchedTransaction(data.transaction);
            } else {
                setSearchedTransaction(null);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchedTransaction(null);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle QR code scan result - auto search with scanned code
    const handleQrScan = async (scannedCode: string) => {
        setSearchTerm(scannedCode);
        setIsSearching(true);

        try {
            const response = await fetch(route('transaction.search', { search: scannedCode }));
            const data = await response.json();

            if (data.transaction) {
                setSearchedTransaction(data.transaction);
                toast.success('Transaksi ditemukan!');
            } else {
                setSearchedTransaction(null);
                toast.error('Transaksi tidak ditemukan untuk kode: ' + scannedCode);
            }
        } catch (error) {
            console.error('QR Search error:', error);
            setSearchedTransaction(null);
            toast.error('Gagal mencari transaksi');
        } finally {
            setIsSearching(false);
        }
    };

    // Handle check-out submit
    const handleCheckOut = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchedTransaction) return;

        // Use router.post directly with data to ensure transaction_id is sent
        router.post(
            route('transaction.checkout'),
            {
                transaction_id: searchedTransaction.id,
                metode_pembayaran: checkOutForm.data.metode_pembayaran,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Live Transaction" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Live Transaction</h2>
                    <p className="text-sm text-muted-foreground">Process vehicle check-in and check-out</p>
                </div>

                {/* Real-time Stats */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vehicles Parked</CardTitle>
                            <Car className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_entry}</div>
                            <p className="text-xs text-muted-foreground">Currently in parking area</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vehicles Exited Today</CardTitle>
                            <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_exit_today}</div>
                            <p className="text-xs text-muted-foreground">Completed transactions today</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Check-In and Check-Out Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Check-In Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ArrowDownToLine className="h-5 w-5 text-blue-600" />
                                <CardTitle>Check-In</CardTitle>
                            </div>
                            <CardDescription>Process new vehicle entry</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCheckIn} className="space-y-4">
                                {/* Camera Placeholder */}
                                <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                                    <div className="text-center">
                                        <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">Camera Preview</p>
                                        <p className="text-xs text-muted-foreground">Barcode scanning (Coming Soon)</p>
                                    </div>
                                </div>

                                {/* Mode Tabs */}
                                <Tabs value={checkInMode} onValueChange={(value) => handleModeChange(value as 'existing' | 'new')}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="existing">Existing Vehicle</TabsTrigger>
                                        <TabsTrigger value="new">New Vehicle</TabsTrigger>
                                    </TabsList>

                                    {/* Existing Vehicle Tab */}
                                    <TabsContent value="existing" className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="vehicle_id">License Plate</Label>
                                            <Select value={checkInForm.data.vehicle_id} onValueChange={handleVehicleSelect}>
                                                <SelectTrigger className={checkInForm.errors.vehicle_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select vehicle" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vehicles.map((vehicle) => (
                                                        <SelectItem key={vehicle.id} value={vehicle.id}>
                                                            {vehicle.plat_nomor} - {vehicle.vehicle_type.nama_tipe}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {checkInForm.errors.vehicle_id && <p className="text-sm text-red-500">{checkInForm.errors.vehicle_id}</p>}
                                        </div>

                                        {/* Vehicle Type - Auto-filled and disabled */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="vehicle_type_id">Vehicle Type</Label>
                                            <Select
                                                value={checkInForm.data.vehicle_type_id}
                                                onValueChange={(value) => checkInForm.setData('vehicle_type_id', value)}
                                                disabled={!!selectedVehicle}
                                            >
                                                <SelectTrigger className={checkInForm.errors.vehicle_type_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vehicleTypes.map((type) => (
                                                        <SelectItem key={type.id} value={type.id}>
                                                            {type.nama_tipe} ({type.kode})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedVehicle && <p className="text-xs text-muted-foreground">Auto-filled from vehicle history</p>}
                                            {checkInForm.errors.vehicle_type_id && (
                                                <p className="text-sm text-red-500">{checkInForm.errors.vehicle_type_id}</p>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* New Vehicle Tab */}
                                    <TabsContent value="new" className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="plat_nomor">License Plate Number</Label>
                                            <Input
                                                id="plat_nomor"
                                                placeholder="e.g., B 1234 ABC"
                                                value={checkInForm.data.plat_nomor}
                                                onChange={(e) => checkInForm.setData('plat_nomor', e.target.value.toUpperCase())}
                                                className={checkInForm.errors.plat_nomor ? 'border-red-500' : ''}
                                            />
                                            {checkInForm.errors.plat_nomor && <p className="text-sm text-red-500">{checkInForm.errors.plat_nomor}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="nama_pemilik">Owner Name (Optional)</Label>
                                            <Input
                                                id="nama_pemilik"
                                                placeholder="e.g., John Doe"
                                                value={checkInForm.data.nama_pemilik}
                                                onChange={(e) => checkInForm.setData('nama_pemilik', e.target.value)}
                                            />
                                        </div>

                                        {/* Vehicle Type - Enabled for new vehicles */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="vehicle_type_id_new">Vehicle Type</Label>
                                            <Select
                                                value={checkInForm.data.vehicle_type_id}
                                                onValueChange={(value) => checkInForm.setData('vehicle_type_id', value)}
                                            >
                                                <SelectTrigger className={checkInForm.errors.vehicle_type_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select vehicle type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vehicleTypes.map((type) => (
                                                        <SelectItem key={type.id} value={type.id}>
                                                            {type.nama_tipe} ({type.kode})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {checkInForm.errors.vehicle_type_id && (
                                                <p className="text-sm text-red-500">{checkInForm.errors.vehicle_type_id}</p>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* Area Parkir - Common for both modes */}
                                <div className="grid gap-2">
                                    <Label htmlFor="area_id">Parking Area</Label>
                                    <Select value={checkInForm.data.area_id} onValueChange={(value) => checkInForm.setData('area_id', value)}>
                                        <SelectTrigger className={checkInForm.errors.area_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select area" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredAreas.map((area) => (
                                                <SelectItem key={area.id} value={area.id} disabled={area.current_capacity <= 0}>
                                                    {area.nama_area} ({area.current_capacity}/{area.total_capacity})
                                                    {area.current_capacity <= 0 && ' - Full'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {checkInForm.errors.area_id && <p className="text-sm text-red-500">{checkInForm.errors.area_id}</p>}
                                </div>

                                <Button type="submit" className="w-full" disabled={checkInForm.processing}>
                                    {checkInForm.processing ? 'Processing...' : 'Process Entry'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Check-Out Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ArrowUpFromLine className="h-5 w-5 text-amber-600" />
                                <CardTitle>Check-Out</CardTitle>
                            </div>
                            <CardDescription>Search and finalize payment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Search */}
                                <div className="grid gap-2">
                                    <Label htmlFor="search">Search Plate or Ticket ID</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="search"
                                            placeholder="e.g., B 1234 ABC or TRX-20260131-0001"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        <Button type="button" variant="outline" onClick={handleSearch} disabled={isSearching}>
                                            <Search className="h-4 w-4" />
                                        </Button>
                                        <Button type="button" variant="secondary" onClick={() => setShowQrScanner(true)} title="Scan QR Code">
                                            <QrCode className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Atau klik tombol QR untuk scan struk parkir</p>
                                </div>

                                {/* Transaction Details (shown after search) */}
                                {searchedTransaction && (
                                    <form onSubmit={handleCheckOut} className="space-y-4">
                                        <div className="space-y-3 rounded-lg border p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Car className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-semibold">
                                                            {searchedTransaction.vehicle.plat_nomor}
                                                            <span className="text-xs text-muted-foreground">
                                                                {' '}
                                                                ({searchedTransaction.vehicle_type.nama_tipe})
                                                            </span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            TICKET ID: #{searchedTransaction.kode_transaksi}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="default" className="primary">
                                                    ACTIVE
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">ENTRY TIME</p>
                                                    <p className="font-medium">{format(new Date(searchedTransaction.jam_masuk), 'HH:mm a')}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(searchedTransaction.jam_masuk), 'dd MMM yyyy')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">DURATION</p>
                                                    <p className="font-medium">{searchedTransaction.duration_formatted || '-'}</p>
                                                </div>
                                            </div>

                                            {searchedTransaction.vehicle.member && (
                                                <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-950/20">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium">Member Discount</p>
                                                            <p className="text-xs text-muted-foreground">{searchedTransaction.vehicle.member.nama}</p>
                                                        </div>
                                                        <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
                                                            {parseFloat(searchedTransaction.vehicle.member.diskon).toFixed(2)}% OFF
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="border-t pt-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-muted-foreground">TOTAL FEE</p>
                                                    <div className="flex items-center gap-2">
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-2xl font-bold">{searchedTransaction.formatted_total_bayar || 'Calculating...'}</p>
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="metode_pembayaran">Payment Method</Label>
                                            <Select
                                                value={checkOutForm.data.metode_pembayaran.toString()}
                                                onValueChange={(value) => checkOutForm.setData('metode_pembayaran', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(paymentMethods).map(([key, value]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {value}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button type="submit" className="w-full" disabled={checkOutForm.processing}>
                                            {checkOutForm.processing ? 'Processing...' : 'Complete Payment & Exit'}
                                        </Button>
                                    </form>
                                )}

                                {!searchedTransaction && !isSearching && searchTerm && (
                                    <div className="rounded-lg border border-dashed p-8 text-center">
                                        <p className="text-sm text-muted-foreground">No active transaction found</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Error Dialog */}
            <NotificationDialog
                open={showErrorDialog}
                onOpenChange={setShowErrorDialog}
                variant="error"
                title="Error"
                message={flashMessages?.error || ''}
            />

            {/* Receipt Modal */}
            <ReceiptModal open={showReceipt} onOpenChange={handleReceiptClose} transaction={receiptTransaction} type={receiptType} />

            {/* QR Scanner Modal */}
            <QrScanner open={showQrScanner} onOpenChange={setShowQrScanner} onScan={handleQrScan} />
        </AppLayout>
    );
}
