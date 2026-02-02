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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Data',
        href: '#',
    },
    {
        title: 'Area Parkir',
        href: '/areaparkir',
    },
];

type VehicleType = {
    id: string;
    kode: string;
    nama_tipe: string;
};

type KapasitasArea = {
    id: string;
    vehicle_type_id: string;
    kapasitas: number;
    vehicle_type: VehicleType;
};

type AreaParkir = {
    id: string;
    kode_area: string;
    nama_area: string;
    lokasi: string;
    kapasitas_area: KapasitasArea[];
    created_at: string;
    updated_at: string;
};

type PaginatedAreas = {
    data: AreaParkir[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Props = {
    areas: PaginatedAreas;
    vehicleTypes: VehicleType[];
    filters: {
        search?: string;
    };
};

type FlashMessages = {
    success?: string;
    error?: string;
};

type CapacityEntry = {
    vehicle_type_id: string;
    kapasitas: number;
};

export default function AreaParkirIndex({ areas, vehicleTypes, filters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const flashMessages = flash as FlashMessages;
    const [showSuccessDialog, setShowSuccessDialog] = useState(!!flashMessages?.success);
    const [showErrorDialog, setShowErrorDialog] = useState(!!flashMessages?.error);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingArea, setEditingArea] = useState<AreaParkir | null>(null);
    const [deletingArea, setDeletingArea] = useState<AreaParkir | null>(null);
    const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');
    const [capacityEntries, setCapacityEntries] = useState<CapacityEntry[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [viewingPhoto, setViewingPhoto] = useState<{ url: string; name: string } | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const performSearch = (term: string) => {
        setIsLoading(true);
        router.visit(
            route('areaparkir.index', {
                page: 1,
                per_page: areas.per_page,
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

    const { data, setData, processing, errors, reset } = useForm({
        kode_area: '',
        nama_area: '',
        lokasi: null as File | null,
        kapasitas: [] as CapacityEntry[],
    });

    const columns = [
        {
            key: 'kode_area',
            header: 'Kode Area',
        },
        {
            key: 'nama_area',
            header: 'Nama Area',
        },
        {
            key: 'lokasi',
            header: 'Foto Lokasi',
            render: (row: AreaParkir) => {
                if (!row.lokasi) return <span className="text-muted-foreground">No photo</span>;
                return (
                    <img
                        src={`/storage/area-photos/${row.lokasi}`}
                        alt={row.nama_area}
                        className="h-12 w-12 cursor-pointer rounded object-cover transition-opacity hover:opacity-80"
                        onClick={() => setViewingPhoto({ url: `/storage/area-photos/${row.lokasi}`, name: row.nama_area })}
                        title="Click to view larger"
                        loading="lazy"
                    />
                );
            },
        },
        {
            key: 'total_kapasitas',
            header: 'Total Kapasitas',
            render: (row: AreaParkir) => {
                const total = row.kapasitas_area.reduce((sum, k) => sum + k.kapasitas, 0);
                return <Badge variant="secondary">{total} slot</Badge>;
            },
        },
    ];

    const handleCreate = () => {
        reset();
        setCapacityEntries([]);
        setSelectedVehicleType('');
        setPhotoPreview(null);
        setData({
            kode_area: '',
            nama_area: '',
            lokasi: null,
            kapasitas: [],
        });
        setShowCreateModal(true);
    };

    const handleEdit = (area: AreaParkir) => {
        setEditingArea(area);
        const entries = area.kapasitas_area.map((k) => ({
            vehicle_type_id: k.vehicle_type_id,
            kapasitas: k.kapasitas,
        }));
        setCapacityEntries(entries);
        setSelectedVehicleType('');
        setPhotoPreview(null);
        setData({
            kode_area: area.kode_area,
            nama_area: area.nama_area,
            lokasi: null,
            kapasitas: entries,
        });
    };

    const handleDeleteClick = (area: AreaParkir) => {
        setDeletingArea(area);
    };

    const handleDeleteConfirm = () => {
        if (deletingArea) {
            router.delete(route('areaparkir.destroy', deletingArea.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeletingArea(null);
                },
            });
        }
    };

    const handleAddVehicleType = () => {
        if (!selectedVehicleType) return;
        if (capacityEntries.some((e) => e.vehicle_type_id === selectedVehicleType)) return;

        const newEntry = {
            vehicle_type_id: selectedVehicleType,
            kapasitas: 0,
        };
        const newEntries = [...capacityEntries, newEntry];
        setCapacityEntries(newEntries);
        setData('kapasitas', newEntries);
        setSelectedVehicleType('');
    };

    const handleRemoveVehicleType = (vehicleTypeId: string) => {
        const newEntries = capacityEntries.filter((e) => e.vehicle_type_id !== vehicleTypeId);
        setCapacityEntries(newEntries);
        setData('kapasitas', newEntries);
    };

    const handleCapacityChange = (vehicleTypeId: string, value: number) => {
        const newEntries = capacityEntries.map((e) => (e.vehicle_type_id === vehicleTypeId ? { ...e, kapasitas: value } : e));
        setCapacityEntries(newEntries);
        setData('kapasitas', newEntries);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Manually create FormData to ensure all fields are included
        const formData = new FormData();
        formData.append('kode_area', data.kode_area);
        formData.append('nama_area', data.nama_area);

        if (data.lokasi) {
            formData.append('lokasi', data.lokasi);
        }

        // Add kapasitas as JSON array
        capacityEntries.forEach((entry, index) => {
            formData.append(`kapasitas[${index}][vehicle_type_id]`, entry.vehicle_type_id.toString());
            formData.append(`kapasitas[${index}][kapasitas]`, entry.kapasitas.toString());
        });

        if (editingArea) {
            formData.append('_method', 'PUT');
            router.post(route('areaparkir.update', editingArea.id), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingArea(null);
                    reset();
                    setCapacityEntries([]);
                },
            });
        } else {
            router.post(route('areaparkir.store'), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                    setCapacityEntries([]);
                },
            });
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > areas.last_page || page === areas.current_page) return;

        setIsLoading(true);
        router.visit(
            route('areaparkir.index', {
                page,
                per_page: areas.per_page,
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
        if (!perPage || perPage === areas.per_page) return;

        setIsLoading(true);
        router.visit(
            route('areaparkir.index', {
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('lokasi', file);

        // Generate preview URL
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPhotoPreview(null);
        }
    };

    const getAvailableVehicleTypes = () => {
        return vehicleTypes.filter((vt) => !capacityEntries.some((e) => e.vehicle_type_id === vt.id));
    };

    const getVehicleTypeName = (id: string) => {
        return vehicleTypes.find((vt) => vt.id === id)?.nama_tipe || '';
    };

    const renderCapacityForm = () => (
        <div className="grid gap-2">
            <Label>Kapasitas per Tipe Kendaraan</Label>

            {/* Add Vehicle Type Dropdown */}
            <div className="flex gap-2">
                <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                    <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {getAvailableVehicleTypes().map((vt) => (
                            <SelectItem key={vt.id} value={vt.id}>
                                {vt.nama_tipe}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button type="button" size="icon" onClick={handleAddVehicleType} disabled={!selectedVehicleType}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Capacity Inputs */}
            {capacityEntries.length > 0 ? (
                <div className="space-y-2 rounded-md border p-3">
                    {capacityEntries.map((entry) => (
                        <div key={entry.vehicle_type_id} className="flex items-center gap-3">
                            <Label className="w-32">{getVehicleTypeName(entry.vehicle_type_id)}</Label>
                            <Input
                                type="number"
                                min="0"
                                value={entry.kapasitas}
                                onChange={(e) => handleCapacityChange(entry.vehicle_type_id, parseInt(e.target.value) || 0)}
                                className="flex-1"
                            />
                            <span className="text-sm text-muted-foreground">slot</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveVehicleType(entry.vehicle_type_id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Belum ada tipe kendaraan yang dipilih</p>
            )}
            {errors.kapasitas && <p className="text-sm text-red-500">{errors.kapasitas}</p>}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Area Parkir Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Area Parkir Management</h2>
                    <p className="text-sm text-muted-foreground">Manage parking areas and their capacities</p>
                </div>

                <div className="flex-1">
                    <DataTable
                        data={areas.data}
                        columns={columns}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        createLabel="Create Area"
                        searchable
                        searchPlaceholder="Search areas..."
                        onSearch={onSearchChange}
                        searchTerm={searchTerm}
                        loading={isLoading}
                    />

                    <TablePagination
                        currentPage={areas.current_page}
                        lastPage={areas.last_page}
                        perPage={areas.per_page}
                        total={areas.total}
                        from={areas.from}
                        to={areas.to}
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
                open={!!deletingArea}
                onOpenChange={() => setDeletingArea(null)}
                title="Confirm Delete"
                message={
                    <>
                        Are you sure you want to delete area <strong>{deletingArea?.nama_area}</strong>? This action cannot be undone.
                    </>
                }
                onConfirm={handleDeleteConfirm}
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />

            {/* Create Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Create Parking Area</DialogTitle>
                            <DialogDescription>Add a new parking area with capacity for each vehicle type.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="kode_area">Kode Area</Label>
                                <Input
                                    id="kode_area"
                                    value={data.kode_area}
                                    onChange={(e) => setData('kode_area', e.target.value)}
                                    placeholder="e.g., B1, LT2"
                                    className={errors.kode_area ? 'border-red-500' : ''}
                                />
                                {errors.kode_area && <p className="text-sm text-red-500">{errors.kode_area}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="nama_area">Nama Area</Label>
                                <Input
                                    id="nama_area"
                                    value={data.nama_area}
                                    onChange={(e) => setData('nama_area', e.target.value)}
                                    placeholder="e.g., Basement 1"
                                    className={errors.nama_area ? 'border-red-500' : ''}
                                />
                                {errors.nama_area && <p className="text-sm text-red-500">{errors.nama_area}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="lokasi">Foto Lokasi</Label>
                                <Input
                                    id="lokasi"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className={errors.lokasi ? 'border-red-500' : ''}
                                />
                                {errors.lokasi && <p className="text-sm text-red-500">{errors.lokasi}</p>}
                                {photoPreview && (
                                    <div className="mt-2">
                                        <img src={photoPreview} alt="Preview" className="h-32 w-32 rounded object-cover" loading="lazy" />
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">Upload an image of the parking area location</p>
                            </div>

                            {renderCapacityForm()}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Area'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!editingArea} onOpenChange={() => setEditingArea(null)}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Parking Area</DialogTitle>
                            <DialogDescription>Update parking area information and capacities.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_kode_area">Kode Area</Label>
                                <Input
                                    id="edit_kode_area"
                                    value={data.kode_area}
                                    onChange={(e) => setData('kode_area', e.target.value)}
                                    placeholder="e.g., B1, LT2"
                                    className={errors.kode_area ? 'border-red-500' : ''}
                                />
                                {errors.kode_area && <p className="text-sm text-red-500">{errors.kode_area}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_nama_area">Nama Area</Label>
                                <Input
                                    id="edit_nama_area"
                                    value={data.nama_area}
                                    onChange={(e) => setData('nama_area', e.target.value)}
                                    placeholder="e.g., Basement 1"
                                    className={errors.nama_area ? 'border-red-500' : ''}
                                />
                                {errors.nama_area && <p className="text-sm text-red-500">{errors.nama_area}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_lokasi">Foto Lokasi</Label>
                                <Input
                                    id="edit_lokasi"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className={errors.lokasi ? 'border-red-500' : ''}
                                />
                                {errors.lokasi && <p className="text-sm text-red-500">{errors.lokasi}</p>}
                                {photoPreview ? (
                                    <div className="mt-2">
                                        <p className="mb-1 text-xs text-muted-foreground">New photo preview:</p>
                                        <img src={photoPreview} alt="New preview" className="h-32 w-32 rounded object-cover" loading="lazy" />
                                    </div>
                                ) : editingArea?.lokasi ? (
                                    <div className="mt-2">
                                        <p className="mb-1 text-xs text-muted-foreground">Current photo:</p>
                                        <img
                                            src={`/storage/area-photos/${editingArea.lokasi}`}
                                            alt={editingArea.nama_area}
                                            className="h-32 w-32 rounded object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                ) : null}
                                <p className="text-xs text-muted-foreground">Upload a new image or leave empty to keep current</p>
                            </div>

                            {renderCapacityForm()}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingArea(null)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Area'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Image Preview Modal */}
            <Dialog open={!!viewingPhoto} onOpenChange={() => setViewingPhoto(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{viewingPhoto?.name}</DialogTitle>
                        <DialogDescription>Foto Lokasi Parkir</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4">
                        {viewingPhoto && (
                            <img
                                src={viewingPhoto.url}
                                alt={viewingPhoto.name}
                                className="max-h-[70vh] w-auto rounded-lg object-contain"
                                loading="lazy"
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setViewingPhoto(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
