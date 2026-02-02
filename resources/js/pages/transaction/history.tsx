import { DataTable } from '@/components/data-table';
import { NotificationDialog } from '@/components/notification-dialog';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { QrCode, ScanBarcode } from 'lucide-react';
import { useRef, useState } from 'react';
import { ReceiptModal } from '@/components/receipt-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaction',
        href: '#',
    },
    {
        title: 'History',
        href: '/transaction/history',
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
    vehicle_type: VehicleType;
};

type AreaParkir = {
    id: string;
    nama_area: string;
};

type TarifParkir = {
    id: string;
    harga: number;
};

type Transaction = {
    id: string;
    kode_transaksi: string;
    jam_masuk: string;
    jam_keluar: string | null;
    durasi: number | null;
    total_bayar: number;
    status: number;
    vehicle: Vehicle;
    area: AreaParkir;
    vehicle_type: VehicleType;
    tarif: TarifParkir | null;
    formatted_total_bayar: string;
    duration_formatted: string;
    status_label: string;
};

type PaginatedTransactions = {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Statuses = {
    [key: number]: string;
};

type Props = {
    transactions: PaginatedTransactions;
    statuses: Statuses;
    filters: {
        search?: string;
        start_date?: string;
        end_date?: string;
        status?: number;
    };
};

type FlashMessages = {
    success?: string;
    error?: string;
};

export default function TransactionHistory({ transactions, statuses, filters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const flashMessages = flash as FlashMessages;
    const [showSuccessDialog, setShowSuccessDialog] = useState(!!flashMessages?.success);
    const [showErrorDialog, setShowErrorDialog] = useState(!!flashMessages?.error);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    // Receipt modal state
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
    const [receiptType, setReceiptType] = useState<'checkin' | 'checkout'>('checkin');

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status?.toString() || '');
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const performSearch = (term: string) => {
        setIsLoading(true);
        router.visit(
            route('transaction.history', {
                page: 1,
                per_page: transactions.per_page,
                search: term,
                start_date: startDate,
                end_date: endDate,
                status: statusFilter,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const onSearchChange = (term: string) => {
        setSearchTerm(term);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            performSearch(term);
        }, 300);
    };

    const handleFilterChange = () => {
        setIsLoading(true);
        router.visit(
            route('transaction.history', {
                page: 1,
                per_page: transactions.per_page,
                search: searchTerm,
                start_date: startDate,
                end_date: endDate,
                status: statusFilter,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const columns = [
        {
            key: 'kode_transaksi',
            header: 'Kode Transaksi',
            render: (row: Transaction) => <span className="font-medium">{row.kode_transaksi}</span>,
        },
        {
            key: 'plat_nomor',
            header: 'Plat Nomor',
            render: (row: Transaction) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.vehicle?.plat_nomor || '-'}</span>
                    <span className="text-xs text-muted-foreground">{row.vehicle_type?.nama_tipe || '-'}</span>
                </div>
            ),
        },
        {
            key: 'jam_masuk',
            header: 'Jam Masuk',
            render: (row: Transaction) => (
                <div className="flex flex-col">
                    <span className="text-sm">{format(new Date(row.jam_masuk), 'HH:mm a')}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(row.jam_masuk), 'dd MMM yyyy')}</span>
                </div>
            ),
        },
        {
            key: 'jam_keluar',
            header: 'Jam Keluar',
            render: (row: Transaction) =>
                row.jam_keluar ? (
                    <div className="flex flex-col">
                        <span className="text-sm">{format(new Date(row.jam_keluar), 'HH:mm a')}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(row.jam_keluar), 'dd MMM yyyy')}</span>
                    </div>
                ) : (
                    '-'
                ),
        },
        {
            key: 'durasi',
            header: 'Durasi',
            render: (row: Transaction) => row.duration_formatted || '-',
        },
        {
            key: 'total_bayar',
            header: 'Total Bayar',
            render: (row: Transaction) => <span className="font-medium">{row.formatted_total_bayar}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: Transaction) => {
                if (row.status === 2) {
                    return <Badge variant="default">Selesai</Badge>;
                } else if (row.status === 3) {
                    return <Badge variant="destructive">Dibatalkan</Badge>;
                } else {
                    return <Badge variant="secondary">Parkir</Badge>;
                }
            },
        },
        {
            key: 'actions',
            header: 'Aksi',
            render: (row: Transaction) => (
                <Button variant="ghost" size="sm" onClick={() => handleViewReceipt(row)} title="Lihat Struk">
                    <QrCode className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    const handleViewReceipt = (transaction: Transaction) => {
        setReceiptTransaction(transaction);
        setReceiptType(transaction.jam_keluar ? 'checkout' : 'checkin');
        setShowReceipt(true);
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > transactions.last_page || page === transactions.current_page) return;

        setIsLoading(true);
        router.visit(
            route('transaction.history', {
                page,
                per_page: transactions.per_page,
                search: searchTerm,
                start_date: startDate,
                end_date: endDate,
                status: statusFilter,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        if (!perPage || perPage === transactions.per_page) return;

        setIsLoading(true);
        router.visit(
            route('transaction.history', {
                page: 1,
                per_page: perPage,
                search: searchTerm,
                start_date: startDate,
                end_date: endDate,
                status: statusFilter,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction History" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Transaction History</h2>
                    <p className="text-sm text-muted-foreground">View completed and cancelled transactions</p>
                </div>

                {/* Filters */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="grid gap-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* <SelectItem value="">All Status</SelectItem> */}
                                {Object.entries(statuses).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button onClick={handleFilterChange} className="w-full">
                            Apply Filters
                        </Button>
                    </div>
                </div>

                <div className="flex-1">
                    <DataTable
                        data={transactions.data}
                        columns={columns}
                        // onView={handleView}
                        searchable
                        searchPlaceholder="Search by code or plate..."
                        onSearch={onSearchChange}
                        searchTerm={searchTerm}
                        loading={isLoading}
                    />

                    <TablePagination
                        currentPage={transactions.current_page}
                        lastPage={transactions.last_page}
                        perPage={transactions.per_page}
                        total={transactions.total}
                        from={transactions.from}
                        to={transactions.to}
                        onPageChange={handlePageChange}
                        onPerPageChange={handlePerPageChange}
                    />
                </div>
            </div>

            {/* Success Dialog */}
            <NotificationDialog
                open={showSuccessDialog}
                onOpenChange={setShowSuccessDialog}
                variant="success"
                title="Success"
                message={flashMessages?.success || ''}
            />

            {/* Error Dialog */}
            <NotificationDialog
                open={showErrorDialog}
                onOpenChange={setShowErrorDialog}
                variant="error"
                title="Error"
                message={flashMessages?.error || ''}
            />

            {/* Detail Modal */}
            <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                        <DialogDescription>View detailed transaction information</DialogDescription>
                    </DialogHeader>

                    {selectedTransaction && (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <p className="text-sm font-medium">Transaction Code</p>
                                <p className="text-sm text-muted-foreground">{selectedTransaction.kode_transaksi}</p>
                            </div>

                            <div className="grid gap-2">
                                <p className="text-sm font-medium">Vehicle</p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedTransaction.vehicle.plat_nomor} - {selectedTransaction.vehicle_type.nama_tipe}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <p className="text-sm font-medium">Entry Time</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(selectedTransaction.jam_masuk), 'dd MMM yyyy, HH:mm a')}
                                    </p>
                                </div>
                                {selectedTransaction.jam_keluar && (
                                    <div className="grid gap-2">
                                        <p className="text-sm font-medium">Exit Time</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(selectedTransaction.jam_keluar), 'dd MMM yyyy, HH:mm a')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <p className="text-sm font-medium">Duration</p>
                                <p className="text-sm text-muted-foreground">{selectedTransaction.duration_formatted}</p>
                            </div>

                            <div className="grid gap-2">
                                <p className="text-sm font-medium">Parking Area</p>
                                <p className="text-sm text-muted-foreground">{selectedTransaction.area.nama_area}</p>
                            </div>

                            <div className="grid gap-2">
                                <p className="text-sm font-medium">Total Payment</p>
                                <p className="text-lg font-bold">{selectedTransaction.formatted_total_bayar}</p>
                            </div>

                            <div className="grid gap-2">
                                <p className="text-sm font-medium">Status</p>
                                <div>
                                    {selectedTransaction.status === 2 ? (
                                        <Badge variant="default">Selesai</Badge>
                                    ) : selectedTransaction.status === 3 ? (
                                        <Badge variant="destructive">Dibatalkan</Badge>
                                    ) : (
                                        <Badge variant="secondary">Parkir</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Receipt Modal for viewing/printing receipts with QR code */}
            <ReceiptModal open={showReceipt} onOpenChange={setShowReceipt} transaction={receiptTransaction} type={receiptType} />
        </AppLayout>
    );
}
