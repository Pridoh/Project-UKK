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
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Data',
        href: '#',
    },
    {
        title: 'Member',
        href: '/member',
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
    is_used?: boolean;
};

type Member = {
    id: string;
    vehicle_id: string;
    nama: string;
    tipe_member: number;
    package_duration: number;
    diskon: string;
    start_date: string;
    end_date: string;
    vehicle: Vehicle;
    created_at: string;
    updated_at: string;
};

type PaginatedMembers = {
    data: Member[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type MemberTypes = {
    [key: number]: string;
};

type MemberPackages = {
    [key: number]: string;
};

type Props = {
    members: PaginatedMembers;
    vehicles: Vehicle[];
    memberTypes: MemberTypes;
    memberPackages: MemberPackages;
};

type FlashMessages = {
    success?: string;
    error?: string;
};

// Helper function to get member type badge with theme-compatible colors
const getMemberTypeBadge = (type: number) => {
    switch (type) {
        case 1: // Regular
            return (
                <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                    Regular
                </Badge>
            );
        case 2: // Silver
            return (
                <Badge variant="outline" className="border-blue-500/50 text-blue-600 dark:text-blue-400">
                    Silver
                </Badge>
            );
        case 3: // Gold
            return (
                <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
                    Gold
                </Badge>
            );
        default:
            return <Badge variant="secondary">Unknown</Badge>;
    }
};

// Helper function to check if membership is active
const isMembershipActive = (endDate: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(endDate);
    expiry.setHours(0, 0, 0, 0);
    return expiry >= today;
};

export default function MemberIndex({ members, vehicles, memberTypes, memberPackages }: Props) {
    const { flash } = usePage<SharedData>().props;
    const flashMessages = flash as FlashMessages;
    const [showSuccessDialog, setShowSuccessDialog] = useState(!!flashMessages?.success);
    const [showErrorDialog, setShowErrorDialog] = useState(!!flashMessages?.error);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [deletingMember, setDeletingMember] = useState<Member | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        vehicle_id: '',
        nama: '',
        tipe_member: 1,
        package_duration: 1,
        diskon: 0,
    });

    const columns = [
        {
            key: 'nama',
            header: 'Nama Member',
        },
        {
            key: 'vehicle',
            header: 'Plat Nomor',
            render: (row: Member) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.vehicle?.plat_nomor || '-'}</span>
                    <span className="text-xs text-muted-foreground">{row.vehicle?.vehicle_type?.nama_tipe || '-'}</span>
                </div>
            ),
        },
        {
            key: 'tipe_member',
            header: 'Tipe Member',
            render: (row: Member) => getMemberTypeBadge(row.tipe_member),
        },
        {
            key: 'diskon',
            header: 'Diskon',
            render: (row: Member) => `${parseFloat(row.diskon).toFixed(2)}%`,
        },
        {
            key: 'end_date',
            header: 'Tanggal Berakhir',
            render: (row: Member) => {
                const isActive = isMembershipActive(row.end_date);
                return (
                    <div className="flex flex-col">
                        <span className={cn('text-sm font-medium', !isActive && 'text-red-600 dark:text-red-400')}>
                            {format(new Date(row.end_date), 'dd MMM yyyy')}
                        </span>
                        {!isActive && <span className="text-xs text-red-600 dark:text-red-400">Expired</span>}
                    </div>
                );
            },
        },
    ];

    const handleCreate = () => {
        reset();
        setData({
            vehicle_id: '',
            nama: '',
            tipe_member: 1,
            package_duration: 1,
            diskon: 0,
        });
        setShowCreateModal(true);
    };

    const handleEdit = (member: Member) => {
        setEditingMember(member);
        setData({
            vehicle_id: member.vehicle_id,
            nama: member.nama,
            tipe_member: member.tipe_member,
            package_duration: member.package_duration,
            diskon: parseFloat(member.diskon),
        });
    };

    const handleDeleteClick = (member: Member) => {
        setDeletingMember(member);
    };

    const handleDeleteConfirm = () => {
        if (deletingMember) {
            router.delete(route('member.destroy', deletingMember.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeletingMember(null);
                },
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingMember) {
            put(route('member.update', editingMember.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingMember(null);
                    reset();
                },
            });
        } else {
            post(route('member.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                },
            });
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > members.last_page || page === members.current_page) return;

        router.visit(
            route('member.index', {
                page,
                per_page: members.per_page,
            }),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        if (!perPage || perPage === members.per_page) return;

        router.visit(
            route('member.index', {
                page: 1,
                per_page: perPage,
            }),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    // Get suggested discount based on member type
    const getSuggestedDiscount = (type: number): number => {
        const suggestions: { [key: number]: number } = {
            1: 0, // Regular
            2: 5, // Silver
            3: 10, // Gold
        };
        return suggestions[type] || 0;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Member Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Member Management</h2>
                    <p className="text-sm text-muted-foreground">Manage parking members and their membership benefits</p>
                </div>

                <div className="flex-1">
                    <DataTable
                        data={members.data}
                        columns={columns}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        createLabel="Create Member"
                        searchable
                        searchPlaceholder="Search members..."
                    />

                    <TablePagination
                        currentPage={members.current_page}
                        lastPage={members.last_page}
                        perPage={members.per_page}
                        total={members.total}
                        from={members.from}
                        to={members.to}
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
                open={!!deletingMember}
                onOpenChange={() => setDeletingMember(null)}
                title="Confirm Delete"
                message={
                    <>
                        Are you sure you want to delete member <strong>{deletingMember?.nama}</strong>? This action cannot be undone.
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
                            <DialogTitle>Create Member</DialogTitle>
                            <DialogDescription>Add a new parking member with membership benefits.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="vehicle_id">Kendaraan</Label>
                                <Select value={data.vehicle_id} onValueChange={(value) => setData('vehicle_id', value)}>
                                    <SelectTrigger className={errors.vehicle_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Pilih kendaraan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicles.map((vehicle) => (
                                            <SelectItem key={vehicle.id} value={vehicle.id} disabled={vehicle.is_used}>
                                                {vehicle.plat_nomor} - {vehicle.nama_pemilik || 'No Owner'} ({vehicle.vehicle_type.nama_tipe}){' '}
                                                {vehicle.is_used ? '(In Use)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.vehicle_id && <p className="text-sm text-red-500">{errors.vehicle_id}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="nama">Nama Member</Label>
                                <Input
                                    id="nama"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="e.g., John Doe"
                                    className={errors.nama ? 'border-red-500' : ''}
                                />
                                {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tipe_member">Tipe Member</Label>
                                <Select
                                    value={data.tipe_member.toString()}
                                    onValueChange={(value) => {
                                        const type = parseInt(value);
                                        setData('tipe_member', type);
                                        // Auto-fill suggested discount
                                        if (data.diskon === 0 || data.diskon === getSuggestedDiscount(data.tipe_member)) {
                                            setData('diskon', getSuggestedDiscount(type));
                                        }
                                    }}
                                >
                                    <SelectTrigger className={errors.tipe_member ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(memberTypes).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tipe_member && <p className="text-sm text-red-500">{errors.tipe_member}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="diskon">Diskon (%)</Label>
                                <Input
                                    id="diskon"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.diskon}
                                    onChange={(e) => setData('diskon', parseFloat(e.target.value) || 0)}
                                    className={errors.diskon ? 'border-red-500' : ''}
                                    placeholder="0.00"
                                />
                                {errors.diskon && <p className="text-sm text-red-500">{errors.diskon}</p>}
                                {data.tipe_member && (
                                    <p className="text-xs text-muted-foreground">Suggested: {getSuggestedDiscount(data.tipe_member)}%</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="package_duration">Paket Membership</Label>
                                <Select
                                    value={data.package_duration.toString()}
                                    onValueChange={(value) => setData('package_duration', parseInt(value))}
                                >
                                    <SelectTrigger className={errors.package_duration ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Pilih paket" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(memberPackages).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.package_duration && <p className="text-sm text-red-500">{errors.package_duration}</p>}
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
            <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Member</DialogTitle>
                            <DialogDescription>Update member information and membership details.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_vehicle_id">Kendaraan</Label>
                                <Select value={data.vehicle_id} onValueChange={(value) => setData('vehicle_id', value)}>
                                    <SelectTrigger className={errors.vehicle_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Pilih kendaraan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicles.map((vehicle) => (
                                            <SelectItem
                                                key={vehicle.id}
                                                value={vehicle.id}
                                                disabled={vehicle.is_used && vehicle.id !== editingMember?.vehicle_id}
                                            >
                                                {vehicle.plat_nomor} - {vehicle.nama_pemilik || 'No Owner'} ({vehicle.vehicle_type.nama_tipe}){' '}
                                                {vehicle.is_used && vehicle.id !== editingMember?.vehicle_id ? '(In Use)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.vehicle_id && <p className="text-sm text-red-500">{errors.vehicle_id}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_nama">Nama Member</Label>
                                <Input
                                    id="edit_nama"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="e.g., John Doe"
                                    className={errors.nama ? 'border-red-500' : ''}
                                />
                                {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_tipe_member">Tipe Member</Label>
                                <Select
                                    value={data.tipe_member.toString()}
                                    onValueChange={(value) => {
                                        const type = parseInt(value);
                                        setData('tipe_member', type);
                                    }}
                                >
                                    <SelectTrigger className={errors.tipe_member ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(memberTypes).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tipe_member && <p className="text-sm text-red-500">{errors.tipe_member}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_diskon">Diskon (%)</Label>
                                <Input
                                    id="edit_diskon"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.diskon}
                                    onChange={(e) => setData('diskon', parseFloat(e.target.value) || 0)}
                                    className={errors.diskon ? 'border-red-500' : ''}
                                    placeholder="0.00"
                                />
                                {errors.diskon && <p className="text-sm text-red-500">{errors.diskon}</p>}
                                {data.tipe_member && (
                                    <p className="text-xs text-muted-foreground">Suggested: {getSuggestedDiscount(data.tipe_member)}%</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_package_duration">Paket Membership</Label>
                                <Select
                                    value={data.package_duration.toString()}
                                    onValueChange={(value) => setData('package_duration', parseInt(value))}
                                >
                                    <SelectTrigger className={errors.package_duration ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Pilih paket" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(memberPackages).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.package_duration && <p className="text-sm text-red-500">{errors.package_duration}</p>}
                                <p className="text-xs text-muted-foreground">Changing package will reset the end date based on today.</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingMember(null)} disabled={processing}>
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
