import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { NotificationDialog } from '@/components/notification-dialog';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Data',
        href: '#',
    },
    {
        title: 'Tarif Parkir',
        href: '/tarifparkir',
    },
];

type VehicleType = {
    id: string;
    kode: string;
    nama_tipe: string;
};

type TarifParkir = {
    id: string;
    vehicle_type_id: string;
    durasi_min: number;
    durasi_max: number;
    harga: number;
    is_active: number;
    vehicle_type: VehicleType;
    created_at: string;
    updated_at: string;
};

type PaginatedTariffs = {
    data: TarifParkir[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Props = {
    tariffs: PaginatedTariffs;
    vehicleTypes: VehicleType[];
    filters: {
        search?: string;
    };
};

type FlashMessages = {
    success?: string;
    error?: string;
};

// Helper function to format duration from minutes to hours
const formatDuration = (minutes: number): string => {
    const hours = minutes / 60;
    return hours % 1 === 0 ? `${hours}` : hours.toFixed(1);
};

export default function TarifParkirIndex({ tariffs, vehicleTypes, filters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const flashMessages = flash as FlashMessages;
    const [showSuccessDialog, setShowSuccessDialog] = useState(!!flashMessages?.success);
    const [showErrorDialog, setShowErrorDialog] = useState(!!flashMessages?.error);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTariff, setEditingTariff] = useState<TarifParkir | null>(null);
    const [deletingTariff, setDeletingTariff] = useState<TarifParkir | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const performSearch = (term: string) => {
        setIsLoading(true);
        router.visit(
            route('tarifparkir.index', {
                page: 1,
                per_page: tariffs.per_page,
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

    const { data, setData, post, put, processing, errors, reset } = useForm({
        vehicle_type_id: '',
        durasi_min: 0,
        durasi_max: 60,
        harga: 0,
        is_active: true as boolean,
    });

    const columns = [
        {
            key: 'vehicle_type',
            header: 'Tipe Kendaraan',
            render: (row: TarifParkir) => row.vehicle_type?.nama_tipe || '-',
        },
        {
            key: 'durasi',
            header: 'Durasi',
            render: (row: TarifParkir) => `${formatDuration(row.durasi_min)} - ${formatDuration(row.durasi_max)} Jam`,
        },
        {
            key: 'harga',
            header: 'Harga',
            render: (row: TarifParkir) => `Rp ${row.harga.toLocaleString('id-ID')}`,
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (row: TarifParkir) =>
                row.is_active ? (
                    <Badge variant="default" className="primary">
                        Active
                    </Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                ),
        },
    ];

    const handleCreate = () => {
        reset();
        setData({
            vehicle_type_id: '',
            durasi_min: 0,
            durasi_max: 60,
            harga: 0,
            is_active: true,
        });
        setShowCreateModal(true);
    };

    const handleEdit = (tariff: TarifParkir) => {
        setEditingTariff(tariff);
        setData({
            vehicle_type_id: tariff.vehicle_type_id,
            durasi_min: tariff.durasi_min,
            durasi_max: tariff.durasi_max,
            harga: tariff.harga,
            is_active: !!tariff.is_active,
        });
    };

    const handleDeleteClick = (tariff: TarifParkir) => {
        setDeletingTariff(tariff);
    };

    const handleDeleteConfirm = () => {
        if (deletingTariff) {
            router.delete(route('tarifparkir.destroy', deletingTariff.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeletingTariff(null);
                },
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingTariff) {
            put(route('tarifparkir.update', editingTariff.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingTariff(null);
                    reset();
                },
            });
        } else {
            post(route('tarifparkir.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                },
            });
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > tariffs.last_page || page === tariffs.current_page) return;

        setIsLoading(true);
        router.visit(
            route('tarifparkir.index', {
                page,
                per_page: tariffs.per_page,
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
        if (!perPage || perPage === tariffs.per_page) return;

        setIsLoading(true);
        router.visit(
            route('tarifparkir.index', {
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
            <Head title="Parking Tariff Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Tarif Parkir Management</h2>
                    <p className="text-sm text-muted-foreground">Manage parking tariffs based on duration and vehicle type</p>
                </div>

                <div className="flex-1">
                    <DataTable
                        data={tariffs.data}
                        columns={columns}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        createLabel="Create Tariff"
                        searchable
                        searchPlaceholder="Search tarif..."
                        onSearch={onSearchChange}
                        searchTerm={searchTerm}
                        loading={isLoading}
                    />

                    <TablePagination
                        currentPage={tariffs.current_page}
                        lastPage={tariffs.last_page}
                        perPage={tariffs.per_page}
                        total={tariffs.total}
                        from={tariffs.from}
                        to={tariffs.to}
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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deletingTariff}
                onOpenChange={() => setDeletingTariff(null)}
                title="Confirm Delete"
                message={
                    <>
                        Are you sure you want to delete this tariff for <strong>{deletingTariff?.vehicle_type?.nama_tipe}</strong>? This action cannot
                        be undone.
                    </>
                }
                onConfirm={handleDeleteConfirm}
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />

            {/* Create Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Create Parking Tariff</DialogTitle>
                            <DialogDescription>Add a new parking tariff with duration range and pricing.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="vehicle_type_id">Tipe Kendaraan</Label>
                                <Select value={data.vehicle_type_id} onValueChange={(value) => setData('vehicle_type_id', value)}>
                                    <SelectTrigger className={errors.vehicle_type_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Pilih tipe kendaraan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicleTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.nama_tipe} ({type.kode})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.vehicle_type_id && <p className="text-sm text-red-500">{errors.vehicle_type_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="durasi_min">Durasi Min (Menit)</Label>
                                    <Input
                                        id="durasi_min"
                                        type="number"
                                        min="0"
                                        value={data.durasi_min}
                                        onChange={(e) => setData('durasi_min', parseInt(e.target.value) || 0)}
                                        className={errors.durasi_min ? 'border-red-500' : ''}
                                    />
                                    {errors.durasi_min && <p className="text-sm text-red-500">{errors.durasi_min}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="durasi_max">Durasi Max (Menit)</Label>
                                    <Input
                                        id="durasi_max"
                                        type="number"
                                        min="0"
                                        value={data.durasi_max}
                                        onChange={(e) => setData('durasi_max', parseInt(e.target.value) || 0)}
                                        className={errors.durasi_max ? 'border-red-500' : ''}
                                    />
                                    {errors.durasi_max && <p className="text-sm text-red-500">{errors.durasi_max}</p>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="harga">Harga (Rp)</Label>
                                <Input
                                    id="harga"
                                    type="number"
                                    min="0"
                                    value={data.harga}
                                    onChange={(e) => setData('harga', parseInt(e.target.value) || 0)}
                                    className={errors.harga ? 'border-red-500' : ''}
                                    placeholder="e.g., 5000"
                                />
                                {errors.harga && <p className="text-sm text-red-500">{errors.harga}</p>}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Active Status</Label>
                                    <p className="text-sm text-muted-foreground">Enable this tariff for transactions</p>
                                </div>
                                <Switch id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!editingTariff} onOpenChange={() => setEditingTariff(null)}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Parking Tariff</DialogTitle>
                            <DialogDescription>Update parking tariff information.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_vehicle_type_id">Tipe Kendaraan</Label>
                                <Select value={data.vehicle_type_id} onValueChange={(value) => setData('vehicle_type_id', value)}>
                                    <SelectTrigger className={errors.vehicle_type_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Pilih tipe kendaraan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicleTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.nama_tipe} ({type.kode})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.vehicle_type_id && <p className="text-sm text-red-500">{errors.vehicle_type_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_durasi_min">Durasi Min (Menit)</Label>
                                    <Input
                                        id="edit_durasi_min"
                                        type="number"
                                        min="0"
                                        value={data.durasi_min}
                                        onChange={(e) => setData('durasi_min', parseInt(e.target.value) || 0)}
                                        className={errors.durasi_min ? 'border-red-500' : ''}
                                    />
                                    {errors.durasi_min && <p className="text-sm text-red-500">{errors.durasi_min}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit_durasi_max">Durasi Max (Menit)</Label>
                                    <Input
                                        id="edit_durasi_max"
                                        type="number"
                                        min="0"
                                        value={data.durasi_max}
                                        onChange={(e) => setData('durasi_max', parseInt(e.target.value) || 0)}
                                        className={errors.durasi_max ? 'border-red-500' : ''}
                                    />
                                    {errors.durasi_max && <p className="text-sm text-red-500">{errors.durasi_max}</p>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_harga">Harga (Rp)</Label>
                                <Input
                                    id="edit_harga"
                                    type="number"
                                    min="0"
                                    value={data.harga}
                                    onChange={(e) => setData('harga', parseInt(e.target.value) || 0)}
                                    className={errors.harga ? 'border-red-500' : ''}
                                    placeholder="e.g., 5000"
                                />
                                {errors.harga && <p className="text-sm text-red-500">{errors.harga}</p>}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label htmlFor="edit_is_active">Active Status</Label>
                                    <p className="text-sm text-muted-foreground">Enable this tariff for transactions</p>
                                </div>
                                <Switch id="edit_is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingTariff(null)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
