import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { NotificationDialog } from '@/components/notification-dialog';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        title: 'Tipe Kendaraan',
        href: '/vehicletype',
    },
];

type VehicleType = {
    id: string;
    kode: string;
    nama_tipe: string;
    ukuran_slot: number;
    tarif_dasar: number;
    created_at: string;
    updated_at: string;
};

type PaginatedVehicleTypes = {
    data: VehicleType[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Props = {
    vehicleTypes: PaginatedVehicleTypes;
};

type FlashMessages = {
    success?: string;
    error?: string;
};

export default function VehicleTypeIndex({ vehicleTypes }: Props) {
    const { flash } = usePage<SharedData>().props;
    const flashMessages = flash as FlashMessages;
    const [showSuccessDialog, setShowSuccessDialog] = useState(!!flashMessages?.success);
    const [showErrorDialog, setShowErrorDialog] = useState(!!flashMessages?.error);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null);
    const [deletingVehicleType, setDeletingVehicleType] = useState<VehicleType | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        kode: '',
        nama_tipe: '',
        ukuran_slot: 1,
        tarif_dasar: 0,
    });

    const columns = [
        {
            key: 'kode',
            header: 'Kode',
        },
        {
            key: 'nama_tipe',
            header: 'Nama Tipe',
        },
        {
            key: 'ukuran_slot',
            header: 'Ukuran Slot',
            render: (row: VehicleType) => `${row.ukuran_slot} slot`,
        },
        {
            key: 'tarif_dasar',
            header: 'Tarif Dasar',
            render: (row: VehicleType) => `Rp ${row.tarif_dasar.toLocaleString('id-ID')}`,
        },
    ];

    const handleCreate = () => {
        reset();
        setData({
            kode: '',
            nama_tipe: '',
            ukuran_slot: 1,
            tarif_dasar: 0,
        });
        setShowCreateModal(true);
    };

    const handleEdit = (vehicleType: VehicleType) => {
        setEditingVehicleType(vehicleType);
        setData({
            kode: vehicleType.kode,
            nama_tipe: vehicleType.nama_tipe,
            ukuran_slot: vehicleType.ukuran_slot,
            tarif_dasar: vehicleType.tarif_dasar,
        });
    };

    const handleDeleteClick = (vehicleType: VehicleType) => {
        setDeletingVehicleType(vehicleType);
    };

    const handleDeleteConfirm = () => {
        if (deletingVehicleType) {
            router.delete(route('vehicletype.destroy', deletingVehicleType.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeletingVehicleType(null);
                },
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingVehicleType) {
            put(route('vehicletype.update', editingVehicleType.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingVehicleType(null);
                    reset();
                },
            });
        } else {
            post(route('vehicletype.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                },
            });
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > vehicleTypes.last_page || page === vehicleTypes.current_page) return;

        router.visit(
            route('vehicletype.index', {
                page,
                per_page: vehicleTypes.per_page,
            }),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        if (!perPage || perPage === vehicleTypes.per_page) return;

        router.visit(
            route('vehicletype.index', {
                page: 1,
                per_page: perPage,
            }),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Type Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Tipe Kendaraan Management</h2>
                    <p className="text-sm text-muted-foreground">Manage vehicle types and their base rates</p>
                </div>

                <div className="flex-1">
                    <DataTable
                        data={vehicleTypes.data}
                        columns={columns}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        createLabel="Create Vehicle Type"
                        searchable
                        searchPlaceholder="Search vehicle types..."
                    />

                    <TablePagination
                        currentPage={vehicleTypes.current_page}
                        lastPage={vehicleTypes.last_page}
                        perPage={vehicleTypes.per_page}
                        total={vehicleTypes.total}
                        from={vehicleTypes.from}
                        to={vehicleTypes.to}
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
                open={!!deletingVehicleType}
                onOpenChange={() => setDeletingVehicleType(null)}
                title="Confirm Delete"
                message={
                    <>
                        Are you sure you want to delete vehicle type <strong>{deletingVehicleType?.nama_tipe}</strong>? This action cannot be undone.
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
                            <DialogTitle>Create Vehicle Type</DialogTitle>
                            <DialogDescription>Add a new vehicle type with its specifications.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="kode">Kode</Label>
                                <Input
                                    id="kode"
                                    value={data.kode}
                                    onChange={(e) => setData('kode', e.target.value)}
                                    placeholder="e.g., MTR, MBL"
                                    className={errors.kode ? 'border-red-500' : ''}
                                />
                                {errors.kode && <p className="text-sm text-red-500">{errors.kode}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="nama_tipe">Nama Tipe</Label>
                                <Input
                                    id="nama_tipe"
                                    value={data.nama_tipe}
                                    onChange={(e) => setData('nama_tipe', e.target.value)}
                                    placeholder="e.g., Motor, Mobil"
                                    className={errors.nama_tipe ? 'border-red-500' : ''}
                                />
                                {errors.nama_tipe && <p className="text-sm text-red-500">{errors.nama_tipe}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="ukuran_slot">Ukuran Slot</Label>
                                <Input
                                    id="ukuran_slot"
                                    type="number"
                                    min="1"
                                    value={data.ukuran_slot}
                                    onChange={(e) => setData('ukuran_slot', parseInt(e.target.value) || 1)}
                                    className={errors.ukuran_slot ? 'border-red-500' : ''}
                                />
                                {errors.ukuran_slot && <p className="text-sm text-red-500">{errors.ukuran_slot}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tarif_dasar">Tarif Dasar (Rp)</Label>
                                <Input
                                    id="tarif_dasar"
                                    type="number"
                                    min="0"
                                    value={data.tarif_dasar}
                                    onChange={(e) => setData('tarif_dasar', parseInt(e.target.value) || 0)}
                                    className={errors.tarif_dasar ? 'border-red-500' : ''}
                                />
                                {errors.tarif_dasar && <p className="text-sm text-red-500">{errors.tarif_dasar}</p>}
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
            <Dialog open={!!editingVehicleType} onOpenChange={() => setEditingVehicleType(null)}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Vehicle Type</DialogTitle>
                            <DialogDescription>Update vehicle type information.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_kode">Kode</Label>
                                <Input
                                    id="edit_kode"
                                    value={data.kode}
                                    onChange={(e) => setData('kode', e.target.value)}
                                    placeholder="e.g., MTR, MBL"
                                    className={errors.kode ? 'border-red-500' : ''}
                                />
                                {errors.kode && <p className="text-sm text-red-500">{errors.kode}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_nama_tipe">Nama Tipe</Label>
                                <Input
                                    id="edit_nama_tipe"
                                    value={data.nama_tipe}
                                    onChange={(e) => setData('nama_tipe', e.target.value)}
                                    placeholder="e.g., Motor, Mobil"
                                    className={errors.nama_tipe ? 'border-red-500' : ''}
                                />
                                {errors.nama_tipe && <p className="text-sm text-red-500">{errors.nama_tipe}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_ukuran_slot">Ukuran Slot</Label>
                                <Input
                                    id="edit_ukuran_slot"
                                    type="number"
                                    min="1"
                                    value={data.ukuran_slot}
                                    onChange={(e) => setData('ukuran_slot', parseInt(e.target.value) || 1)}
                                    className={errors.ukuran_slot ? 'border-red-500' : ''}
                                />
                                {errors.ukuran_slot && <p className="text-sm text-red-500">{errors.ukuran_slot}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_tarif_dasar">Tarif Dasar (Rp)</Label>
                                <Input
                                    id="edit_tarif_dasar"
                                    type="number"
                                    min="0"
                                    value={data.tarif_dasar}
                                    onChange={(e) => setData('tarif_dasar', parseInt(e.target.value) || 0)}
                                    className={errors.tarif_dasar ? 'border-red-500' : ''}
                                />
                                {errors.tarif_dasar && <p className="text-sm text-red-500">{errors.tarif_dasar}</p>}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingVehicleType(null)} disabled={processing}>
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
