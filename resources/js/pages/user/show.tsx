import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Mail, Shield, User as UserIcon } from 'lucide-react';

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
        title: 'Detail',
        href: '#',
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

type Props = {
    user: User;
};

export default function ShowUser({ user }: Props) {
    const handleBack = () => {
        router.visit(route('user.index'));
    };

    const handleEdit = () => {
        router.visit(route('user.edit', user.id));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User Detail - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">User Detail</h2>
                        <p className="text-sm text-muted-foreground">View user information</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" onClick={handleBack} className="w-full sm:w-auto">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button onClick={handleEdit} className="w-full sm:w-auto">
                            Edit User
                        </Button>
                    </div>
                </div>

                <Card className="w-full max-w-3xl">
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-xl sm:text-2xl">{user.name}</CardTitle>
                                <CardDescription className="text-sm">@{user.username}</CardDescription>
                            </div>
                            {user.is_active ? (
                                <Badge variant="default" className="primary">
                                    Active
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Inactive</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <UserIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                    <p className="text-base font-medium">{user.name}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                                    <p className="text-base font-medium break-words">{user.email}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <UserIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                                    <p className="text-base font-medium">@{user.username}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-base font-medium">{user.role?.role_name || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                        <p className="text-sm break-words">{formatDate(user.created_at)}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                        <p className="text-sm break-words">{formatDate(user.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
