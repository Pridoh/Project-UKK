import InputError from '@/components/input-error';
import { SearchableRoleSelect } from '@/components/searchable-role-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Master Data',
        href: '#',
    },
    {
        title: 'User',
        href: '/user',
    },
    {
        title: 'Create',
        href: '/user/create',
    },
];

type Role = {
    id: string;
    role_name: string;
};

type Props = {
    roles: Role[];
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

export default function CreateUser({ roles }: Props) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);

    const { data, setData, post, errors, processing } = useForm<UserForm>({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        is_active: true,
    });

    const handleCancel = () => {
        setShowCancelDialog(true);
    };

    const handleCancelConfirm = () => {
        router.visit(route('user.index'));
    };

    const handleSubmitClick: FormEventHandler = (e) => {
        e.preventDefault();
        setShowSubmitDialog(true);
    };

    const handleSubmitConfirm = () => {
        setShowSubmitDialog(false);
        post(route('user.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Create User</h2>
                    <p className="text-sm text-muted-foreground">Add a new user to the system</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>Fill in the details to create a new user account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmitClick} className="space-y-6">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter full name"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="username">
                                        Username <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="username"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="Enter username"
                                        required
                                    />
                                    <InputError message={errors.username} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter email address"
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        Password <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter password"
                                        required
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirm password"
                                        required
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="role_id">
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
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer font-normal">
                                        Active
                                    </Label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    {processing ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Creation</DialogTitle>
                        <DialogDescription>Are you sure you want to cancel? All entered data will be lost</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            Continue Editing
                        </Button>
                        <Button variant="destructive" onClick={handleCancelConfirm}>
                            Yes, Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Submit Confirmation Dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Create User</DialogTitle>
                        <DialogDescription>Are you sure you want to create this user?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitConfirm} disabled={processing}>
                            {processing ? 'Creating...' : 'Yes, Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
