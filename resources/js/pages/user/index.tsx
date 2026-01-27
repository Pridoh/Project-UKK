import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Data',
        href: '#',
    },
    {
        title: 'User',
        href: '/user',
    },
];

type Role = {
    id: string;
    role_name: string;
};

type User = {
    id: string;
    name: string;
    username: string;
    email: string;
    is_active: boolean;
    role_id: string;
    role: Role;
    created_at: string;
    updated_at: string;
};

type PaginatedUsers = {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Props = {
    users: PaginatedUsers;
};

export default function UserIndex({ users }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [showSuccessDialog, setShowSuccessDialog] = useState(!!(flash as any)?.success);
    const [showErrorDialog, setShowErrorDialog] = useState(!!(flash as any)?.error);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [filteredTotal, setFilteredTotal] = useState<number | null>(null);

    const columns = [
        {
            key: 'name',
            header: 'Nama',
        },
        {
            key: 'email',
            header: 'Email',
        },
        {
            key: 'role',
            header: 'Role',
            render: (row: User) => row.role?.role_name || '-',
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (row: User) =>
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
        router.visit(route('user.create'));
    };

    const handleEdit = (user: User) => {
        router.visit(route('user.edit', user.id));
    };

    const handleShow = (user: User) => {
        router.visit(route('user.show', user.id));
    };

    const handleDeleteClick = (user: User) => {
        setDeleteUser(user);
    };

    const handleDeleteConfirm = () => {
        if (deleteUser) {
            router.delete(route('user.destroy', deleteUser.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteUser(null);
                },
            });
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > users.last_page || page === users.current_page) return;

        router.visit(
            route('user.index', {
                page,
                per_page: users.per_page,
            }),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        if (!perPage || perPage === users.per_page) return;

        router.visit(
            route('user.index', {
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
            <Head title="User Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                    <p className="text-sm text-muted-foreground">Manage system users and their roles</p>
                </div>

                <div className="flex-1">
                    <DataTable
                        data={users.data}
                        columns={columns}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onShow={handleShow}
                        onDelete={handleDeleteClick}
                        createLabel="Create User"
                        searchable
                        searchPlaceholder="Search users..."
                        onFilteredCountChange={(count) => setFilteredTotal(count)}
                    />

                    <div className="mt-3 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-col-2 flex gap-1">
                            {(() => {
                                const totalEntries = filteredTotal !== null ? filteredTotal : users.total;
                                const startEntry = totalEntries === 0 ? 0 : 1;
                                const endEntry = totalEntries;

                                return (
                                    <>
                                        Showing <span className="font-medium">{startEntry}</span> - <span className="font-medium">{endEntry}</span> of{' '}
                                        <span className="font-medium">{totalEntries}</span> entries
                                    </>
                                );
                            })()}
                        </div>

                        <Pagination>
                            <div className="flex items-center gap-2">
                                <span>Show</span>
                                <Select value={String(users.per_page)} onValueChange={(value) => handlePerPageChange(Number(value))}>
                                    <SelectTrigger className="h-8 w-[80px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 20, 40, 50].map((size) => (
                                            <SelectItem key={size} value={String(size)}>
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span>entries</span>
                            </div>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        size="default"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(users.current_page - 1);
                                        }}
                                        className={users.current_page === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>

                                {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href="#"
                                            size="icon"
                                            isActive={page === users.current_page}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(page);
                                            }}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        size="default"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(users.current_page + 1);
                                        }}
                                        className={users.current_page === users.last_page ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </div>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent>
                    <DialogHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <DialogTitle className="text-center">Success</DialogTitle>
                        <DialogDescription className="text-center">{(flash as any)?.success}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button onClick={() => setShowSuccessDialog(false)}>OK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Error Dialog */}
            <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <DialogContent>
                    <DialogHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-center">Error</DialogTitle>
                        <DialogDescription className="text-center">{(flash as any)?.error}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button variant="destructive" onClick={() => setShowErrorDialog(false)}>
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete user <strong>{deleteUser?.name}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteUser(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
