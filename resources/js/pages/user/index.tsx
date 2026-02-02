import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import InputError from '@/components/input-error';
import { NotificationDialog } from '@/components/notification-dialog';
import { SearchableRoleSelect } from '@/components/searchable-role-select';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, Mail, Shield, User as UserIcon } from 'lucide-react';
import { useRef, useState } from 'react';

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
    roles: Role[];
    filters: {
        search?: string;
    };
};

type FlashMessages = {
    success?: string;
    error?: string;
};

type UserForm = {
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_id: string;
    is_active: boolean;
};

export default function UserIndex({ users, roles, filters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const flashMessages = flash as FlashMessages;
    const [showSuccessDialog, setShowSuccessDialog] = useState(!!flashMessages?.success);
    const [showErrorDialog, setShowErrorDialog] = useState(!!flashMessages?.error);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm<UserForm>({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        is_active: true,
    });

    const performSearch = (term: string) => {
        setIsLoading(true);
        router.visit(
            route('user.index', {
                page: 1,
                per_page: users.per_page,
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
        reset();
        setData({
            name: '',
            username: '',
            email: '',
            password: '',
            password_confirmation: '',
            role_id: '',
            is_active: true,
        });
        setShowCreateModal(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            username: user.username,
            email: user.email,
            password: '',
            password_confirmation: '',
            role_id: user.role_id,
            is_active: user.is_active,
        });
    };

    const handleShow = (user: User) => {
        setViewingUser(user);
    };

    const handleDeleteClick = (user: User) => {
        setDeletingUser(user);
    };

    const handleDeleteConfirm = () => {
        if (deletingUser) {
            router.delete(route('user.destroy', deletingUser.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeletingUser(null);
                },
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            put(route('user.update', editingUser.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingUser(null);
                    reset();
                },
            });
        } else {
            post(route('user.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                },
            });
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > users.last_page || page === users.current_page) return;

        setIsLoading(true);
        router.visit(
            route('user.index', {
                page,
                per_page: users.per_page,
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
        if (!perPage || perPage === users.per_page) return;

        setIsLoading(true);
        router.visit(
            route('user.index', {
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

    const formatDateParts = (dateString: string) => {
        const date = new Date(dateString);
        const datePart = date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const timePart = date
            .toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            })
            .replace(':', '.');
        return { datePart, timePart };
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
                        onSearch={onSearchChange}
                        searchTerm={searchTerm}
                        loading={isLoading}
                    />

                    <TablePagination
                        currentPage={users.current_page}
                        lastPage={users.last_page}
                        perPage={users.per_page}
                        total={users.total}
                        from={users.from}
                        to={users.to}
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
                open={!!deletingUser}
                onOpenChange={() => setDeletingUser(null)}
                title="Confirm Delete"
                message={
                    <>
                        Are you sure you want to delete user <strong>{deletingUser?.name}</strong>? This action cannot be undone.
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
                            <DialogTitle>Create User</DialogTitle>
                            <DialogDescription>Add a new user to the system with their role and permissions.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create_name">
                                    Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="create_name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter full name"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create_username">
                                    Username <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="create_username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Enter username"
                                    className={errors.username ? 'border-red-500' : ''}
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create_email">
                                    Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="create_email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter email address"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create_password">
                                    Password <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="create_password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter password"
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create_password_confirmation">
                                    Confirm Password <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="create_password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm password"
                                    className={errors.password_confirmation ? 'border-red-500' : ''}
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create_role_id">
                                    Role <span className="text-destructive">*</span>
                                </Label>
                                <SearchableRoleSelect
                                    value={data.role_id}
                                    onValueChange={(value) => setData('role_id', value)}
                                    roles={roles}
                                    error={errors.role_id}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="create_is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="create_is_active" className="cursor-pointer font-normal">
                                    Active
                                </Label>
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
            <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>Update user information and permissions.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_name">
                                    Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="edit_name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter full name"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_username">
                                    Username <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="edit_username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Enter username"
                                    className={errors.username ? 'border-red-500' : ''}
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_email">
                                    Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="edit_email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter email address"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_password">
                                    Password <span className="text-muted-foreground">(leave blank to keep current)</span>
                                </Label>
                                <Input
                                    id="edit_password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter new password"
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_password_confirmation">Confirm Password</Label>
                                <Input
                                    id="edit_password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm new password"
                                    className={errors.password_confirmation ? 'border-red-500' : ''}
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit_role_id">
                                    Role <span className="text-destructive">*</span>
                                </Label>
                                <SearchableRoleSelect
                                    value={data.role_id}
                                    onValueChange={(value) => setData('role_id', value)}
                                    roles={roles}
                                    error={errors.role_id}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit_is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="edit_is_active" className="cursor-pointer font-normal">
                                    Active
                                </Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingUser(null)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View/Show Modal */}
            <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-6">
                            <div>
                                <DialogTitle className="text-xl">{viewingUser?.name}</DialogTitle>
                                <DialogDescription>@{viewingUser?.username}</DialogDescription>
                            </div>
                            {viewingUser?.is_active ? (
                                <Badge variant="default" className="primary shrink-0">
                                    Active
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="shrink-0">
                                    Inactive
                                </Badge>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                <p className="text-base font-medium">{viewingUser?.name}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                                <p className="text-base font-medium break-words">{viewingUser?.email}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Username</p>
                                <p className="text-base font-medium">@{viewingUser?.username}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Role</p>
                                <p className="text-base font-medium">{viewingUser?.role?.role_name || '-'}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                    {viewingUser?.created_at ? (
                                        <div className="text-sm">
                                            <p className="font-medium">{formatDateParts(viewingUser.created_at).datePart}</p>
                                            <p className="text-muted-foreground">{formatDateParts(viewingUser.created_at).timePart}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm">-</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                    {viewingUser?.updated_at ? (
                                        <div className="text-sm">
                                            <p className="font-medium">{formatDateParts(viewingUser.updated_at).datePart}</p>
                                            <p className="text-muted-foreground">{formatDateParts(viewingUser.updated_at).timePart}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm">-</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewingUser(null)}>
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                if (viewingUser) {
                                    setViewingUser(null);
                                    handleEdit(viewingUser);
                                }
                            }}
                        >
                            Edit User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
