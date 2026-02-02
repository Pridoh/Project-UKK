import { DataTable } from '@/components/data-table';
import { NotificationDialog } from '@/components/notification-dialog';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaction',
        href: '#',
    },
    {
        title: 'Vehicle Entry',
        href: '/transaction/entry',
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
    member?: Member;
};

type AreaParkir = {
    id: string;
    nama_area: string;
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
    jam_masuk: string;
    status: number;
    vehicle: Vehicle;
    area: AreaParkir;
    vehicle_type: VehicleType;
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

type Props = {
    transactions: PaginatedTransactions;
    filters: {
        search?: string;
    };
};

type FlashMessages = {
    success?: string;
    error?: string;
};

export default function VehicleEntry({ transactions, filters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const flashMessages = flash as FlashMessages;
    const [showSuccessDialog, setShowSuccessDialog] = useState(!!flashMessages?.success);
    const [showErrorDialog, setShowErrorDialog] = useState(!!flashMessages?.error);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const performSearch = (term: string) => {
        setIsLoading(true);
        router.visit(
            route('transaction.entry', {
                page: 1,
                per_page: transactions.per_page,
                search: term,
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

    const columns = [
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
                    <span className="font-medium">{format(new Date(row.jam_masuk), 'HH:mm a')}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(row.jam_masuk), 'dd MMM yyyy')}</span>
                </div>
            ),
        },
        {
            key: 'area',
            header: 'Area Parkir',
            render: (row: Transaction) => row.area?.nama_area || '-',
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: Transaction) => (
                <Badge variant="default" className="primary">
                    Parkir
                </Badge>
            ),
        },
    ];

    const handleView = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > transactions.last_page || page === transactions.current_page) return;

        setIsLoading(true);
        router.visit(
            route('transaction.entry', {
                page,
                per_page: transactions.per_page,
                search: searchTerm,
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
            route('transaction.entry', {
                page: 1,
                per_page: perPage,
                search: searchTerm,
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
            <Head title="Vehicle Entry" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Vehicle Entry</h2>
                    <p className="text-sm text-muted-foreground">View all vehicles currently parked</p>
                </div>

                <div className="flex-1">
                    <DataTable
                        data={transactions.data}
                        columns={columns}
                        onView={handleView}
                        searchable
                        searchPlaceholder="Search by plate number..."
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
                        <DialogDescription>View detailed information about this transaction</DialogDescription>
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

                            <div className="grid gap-2">
                                <p className="text-sm font-medium">Entry Time</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(selectedTransaction.jam_masuk), 'dd MMM yyyy, HH:mm a')}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <p className="text-sm font-medium">Parking Area</p>
                                <p className="text-sm text-muted-foreground">{selectedTransaction.area.nama_area}</p>
                            </div>

                            {selectedTransaction.vehicle.member && (
                                <div className="rounded-lg border bg-amber-50 p-3 dark:bg-amber-950/20">
                                    <p className="mb-2 text-sm font-medium">Member Information</p>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">ID:</span> {selectedTransaction.vehicle.member.member_id}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">Name:</span> {selectedTransaction.vehicle.member.nama}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">Discount:</span>{' '}
                                            {parseFloat(selectedTransaction.vehicle.member.diskon).toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
