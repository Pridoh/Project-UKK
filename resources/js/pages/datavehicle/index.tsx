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
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Data',
        href: '#',
    },
    {
        title: 'Data Kendaraan',
        href: '/datavehicle',
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
    status: number;
    vehicle_type: VehicleType;
    created_at: string;
    updated_at: string;
};

type PaginatedVehicles = {
    data: Vehicle[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Props = {
    vehicles: PaginatedVehicles;
    vehicleTypes: VehicleType[];
    filters: {
        search?: string;
    };
};

type FlashMessages = {
    success?: string;
    error?: string;
};

export default function DataVehicleIndex({ vehicles, vehicleTypes, filters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const flashMessages = flash as FlashMessages;
    const [showSuccessDialog, setShowSuccessDialog] = useState(!!flashMessages?.success);
    const [showErrorDialog, setShowErrorDialog] = useState(!!flashMessages?.error);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        plat_nomor: '',
        nama_pemilik: '',
        vehicle_type_id: '',
        status: 1,
    });

    const columns = [
        {
            key: 'plat_nomor',
            header: 'Plat Nomor',
        },
        {
            key: 'nama_pemilik',
            header: 'Nama Pemilik',
            render: (row: Vehicle) => row.nama_pemilik || '-',
        },
        {
            key: 'vehicle_type',
            header: 'Tipe Kendaraan',
            render: (row: Vehicle) => row.vehicle_type?.nama_tipe || '-',
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: Vehicle) =>
                row.status === 1 ? (
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
            plat_nomor: '',
            nama_pemilik: '',
            vehicle_type_id: '',
            status: 1,
        });
        setShowCreateModal(true);
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setData({
            plat_nomor: vehicle.plat_nomor,
            nama_pemilik: vehicle.nama_pemilik || '',
            vehicle_type_id: vehicle.vehicle_type_id,
            status: vehicle.status,
        });
    };

    const handleDeleteClick = (vehicle: Vehicle) => {
        setDeletingVehicle(vehicle);
    };

    const handleDeleteConfirm = () => {
        if (deletingVehicle) {
            router.delete(route('datavehicle.destroy', deletingVehicle.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeletingVehicle(null);
                },
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingVehicle) {
            put(route('datavehicle.update', editingVehicle.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingVehicle(null);
                    reset();
                },
            });
        } else {
            post(route('datavehicle.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                },
            });
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > vehicles.last_page || page === vehicles.current_page) return;

        router.visit(
            route('datavehicle.index', {
                page,
                per_page: vehicles.per_page,
                search: filters.search,
            }),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        if (!perPage || perPage === vehicles.per_page) return;

        router.visit(
            route('datavehicle.index', {
                page: 1,
                per_page: perPage,
                search: filters.search,
            }),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Data Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Data Kendaraan Management</h2>
                    <p className="text-sm text-muted-foreground">Manage vehicle data including plate numbers and owners</p>
                </div>

                <div className="flex-1">
                    <DataTable
                        data={vehicles.data}
                        columns={columns}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        createLabel="Create Vehicle"
                        searchable
                        searchPlaceholder="Search vehicles..."
                    />

                    <TablePagination
                        currentPage={vehicles.current_page}
                        lastPage={vehicles.last_page}
                        perPage={vehicles.per_page}
                        total={vehicles.total}
                        from={vehicles.from}
                        to={vehicles.to}
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
                open={!!deletingVehicle}
                onOpenChange={() => setDeletingVehicle(null)}
                title="Confirm Delete"
                message={
                    <>
                        Are you sure you want to delete vehicle <strong>{deletingVehicle?.plat_nomor}</strong>? This action cannot be undone.
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
                            <DialogTitle>Create Vehicle Data</DialogTitle>
                            <DialogDescription>Add a new vehicle with its information.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="plat_nomor">Plat Nomor</Label>
                                <Input
                                    id="plat_nomor"
                                    value={data.plat_nomor}
                                    onChange={(e) => setData('plat_nomor', e.target.value.toUpperCase())}
                                    placeholder="e.g., B 1234 ABC"
                                    className={errors.plat_nomor ? 'border-red-500' : ''}
                                />
                                {errors.plat_nomor && <p className="text-sm text-red-500">{errors.plat_nomor}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="nama_pemilik">
                                    Nama Pemilik <span className="text-muted-foreground">(Optional)</span>
                                </Label>
                                <Input
                                    id="nama_pemilik"
                                    value={data.nama_pemilik}
                                    onChange={(e) => setData('nama_pemilik', e.target.value)}
                                    placeholder="e.g., John Doe"
                                    className={errors.nama_pemilik ? 'border-red-500' : ''}
                                />
                                {errors.nama_pemilik && <p className="text-sm text-red-500">{errors.nama_pemilik}</p>}
                            </div>

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

                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label htmlFor="status">Active Status</Label>
                                    <p className="text-sm text-muted-foreground">Enable this vehicle for transactions</p>
                                </div>
                                <Switch id="status" checked={data.status === 1} onCheckedChange={(checked) => setData('status', checked ? 1 : 0)} />
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
            <Dialog open={!!editingVehicle} onOpenChange={() => setEditingVehicle(null)}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Vehicle Data</DialogTitle>
                            <DialogDescription>Update vehicle information.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_plat_nomor">Plat Nomor</Label>
                                <Input
                                    id="edit_plat_nomor"
                                    value={data.plat_nomor}
                                    onChange={(e) => setData('plat_nomor', e.target.value.toUpperCase())}
                                    placeholder="e.g., B 1234 ABC"
                                    className={errors.plat_nomor ? 'border-red-500' : ''}
                                />
                                {errors.plat_nomor && <p className="text-sm text-red-500">{errors.plat_nomor}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_nama_pemilik">
                                    Nama Pemilik <span className="text-muted-foreground">(Optional)</span>
                                </Label>
                                <Input
                                    id="edit_nama_pemilik"
                                    value={data.nama_pemilik}
                                    onChange={(e) => setData('nama_pemilik', e.target.value)}
                                    placeholder="e.g., John Doe"
                                    className={errors.nama_pemilik ? 'border-red-500' : ''}
                                />
                                {errors.nama_pemilik && <p className="text-sm text-red-500">{errors.nama_pemilik}</p>}
                            </div>

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

                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label htmlFor="edit_status">Active Status</Label>
                                    <p className="text-sm text-muted-foreground">Enable this vehicle for transactions</p>
                                </div>
                                <Switch
                                    id="edit_status"
                                    checked={data.status === 1}
                                    onCheckedChange={(checked) => setData('status', checked ? 1 : 0)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingVehicle(null)} disabled={processing}>
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
