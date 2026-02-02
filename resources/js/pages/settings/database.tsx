import { CountdownConfirmDialog } from '@/components/countdown-confirm-dialog';
import { DataTable } from '@/components/data-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, Archive, Database, Download, FileSpreadsheet, RefreshCw, Trash2, Upload, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Database Management',
        href: '/settings/database',
    },
];

type TableInfo = {
    name: string;
    row_count: number;
    size: number;
    formatted_size: string;
};

type BackupInfo = {
    id: string;
    filename: string;
    backup_type: 1 | 2; // 1: full, 2: partial
    tables: string[] | null;
    tables_count: number | null;
    file_size: number;
    formatted_size: string;
    storage_disk: string;
    created_by_name: string;
    notes: string | null;
    created_at: string;
    is_recovered?: boolean;
};

type Props = {
    tables: TableInfo[];
    backups: BackupInfo[];
};

export default function DatabaseManagement({ tables, backups }: Props) {
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const [isBackupLoading, setIsBackupLoading] = useState(false);
    const [isRestoreLoading, setIsRestoreLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    // Dialog states
    const [showBackupDialog, setShowBackupDialog] = useState(false);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [backupType, setBackupType] = useState<'full' | 'partial'>('full');
    const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);

    // Upload Restore State
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Toggle single table selection
    const toggleTable = (tableName: string) => {
        setSelectedTables((prev) => (prev.includes(tableName) ? prev.filter((t) => t !== tableName) : [...prev, tableName]));
    };

    // Toggle all tables
    const toggleAllTables = () => {
        if (selectedTables.length === tables.length) {
            setSelectedTables([]);
        } else {
            setSelectedTables(tables.map((t) => t.name));
        }
    };

    // Open backup dialog
    const openBackupDialog = (type: 'full' | 'partial') => {
        if (type === 'partial' && selectedTables.length === 0) {
            toast.error('Please select at least one table to backup');
            return;
        }
        setBackupType(type);
        setShowBackupDialog(true);
    };

    // Handle backup
    const handleBackup = () => {
        setIsBackupLoading(true);

        router.post(
            route('database.backup'),
            {
                tables: backupType === 'partial' ? selectedTables : [],
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        backupType === 'full'
                            ? 'Full database backup created successfully'
                            : `Backup for ${selectedTables.length} table(s) created successfully`,
                    );
                    setSelectedTables([]);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors).flat().join(', ') || 'Failed to create backup');
                },
                onFinish: () => {
                    setIsBackupLoading(false);
                    setShowBackupDialog(false);
                },
            },
        );
    };

    // Open restore dialog
    const openRestoreDialog = (backup: BackupInfo) => {
        setSelectedBackup(backup);
        setShowRestoreDialog(true);
    };

    const handleUploadRestore = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) {
            toast.error('Please select a SQL file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('backup_file', uploadFile);

        setIsUploading(true);
        router.post(route('database.upload-restore'), formData, {
            onSuccess: () => {
                setIsUploadDialogOpen(false);
                setUploadFile(null);
                toast.success('Database restored successfully from uploaded file');
            },
            onError: (errors) => {
                toast.error('Failed to restore database from file');
                console.error(errors);
            },
            onFinish: () => setIsUploading(false),
        });
    };

    // Handle restore
    const handleRestore = () => {
        if (!selectedBackup) return;

        setIsRestoreLoading(true);

        router.post(
            route('database.restore'),
            {
                backup_id: selectedBackup.id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        selectedBackup.backup_type === 1
                            ? 'Full database restored successfully'
                            : `Restored ${selectedBackup.tables_count} table(s) successfully`,
                    );
                },
                onError: (errors) => {
                    toast.error(Object.values(errors).flat().join(', ') || 'Failed to restore backup');
                },
                onFinish: () => {
                    setIsRestoreLoading(false);
                    setShowRestoreDialog(false);
                    setSelectedBackup(null);
                },
            },
        );
    };

    // Open delete dialog
    const openDeleteDialog = (backup: BackupInfo) => {
        setSelectedBackup(backup);
        setShowDeleteDialog(true);
    };

    // Handle delete
    const handleDelete = () => {
        if (!selectedBackup) return;

        setIsDeleteLoading(true);

        router.delete(route('database.destroy', selectedBackup.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Backup deleted successfully');
            },
            onError: (errors) => {
                toast.error(Object.values(errors).flat().join(', ') || 'Failed to delete backup');
            },
            onFinish: () => {
                setIsDeleteLoading(false);
                setShowDeleteDialog(false);
                setSelectedBackup(null);
            },
        });
    };

    // Handle download
    const handleDownload = (backup: BackupInfo) => {
        window.location.href = route('database.download', backup.id);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Database Management" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium">Database Management</h3>
                        <p className="text-sm text-muted-foreground">Manage your database backups and restoration.</p>
                    </div>

                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Critical Warning</AlertTitle>
                        <AlertDescription>
                            <ul className="list-inside list-disc space-y-1">
                                <li>
                                    Restoring a database will <strong>permanently overwrite</strong> existing data.
                                </li>
                                <li>Always create a full backup before performing a restore operation.</li>
                                <li>Ensure you have downloaded important backups to a secure location.</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Database Tables Section */}
                        <Card className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">Database Tables</CardTitle>
                                        <CardDescription>Select tables to backup individually.</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={toggleAllTables}>
                                            {selectedTables.length === tables.length ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <DataTable
                                    data={tables}
                                    columns={[
                                        {
                                            key: 'selection',
                                            header: <Checkbox checked={selectedTables.length === tables.length} onCheckedChange={toggleAllTables} />,
                                            render: (row) => (
                                                <Checkbox checked={selectedTables.includes(row.name)} onCheckedChange={() => toggleTable(row.name)} />
                                            ),
                                        },
                                        { key: 'name', header: 'Table Name', render: (row) => <span className="font-mono text-xs">{row.name}</span> },
                                        {
                                            key: 'row_count',
                                            header: 'Rows',
                                            render: (row) => <div className="text-left text-xs">{row.row_count.toLocaleString()}</div>,
                                        },
                                        {
                                            key: 'size',
                                            header: 'Size',
                                            render: (row) => <div className="text-left text-xs text-muted-foreground">{row.formatted_size}</div>,
                                        },
                                    ]}
                                />
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        className="w-full"
                                        size="sm"
                                        onClick={() => openBackupDialog('partial')}
                                        disabled={selectedTables.length === 0 || isBackupLoading}
                                    >
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Backup Selected ({selectedTables.length})
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        size="sm"
                                        onClick={() => openBackupDialog('full')}
                                        disabled={isBackupLoading}
                                    >
                                        <Database className="mr-2 h-4 w-4" />
                                        Backup Full Database
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Backup Rules / Info could go here or just span full width below */}
                        <div className="flex flex-col gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Quick Actions</CardTitle>
                                    <CardDescription>Common database operations.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-2">
                                    <Button variant="outline" className="justify-start" onClick={() => openBackupDialog('full')}>
                                        <UploadCloud className="mr-2 h-4 w-4" />
                                        Create New Full Backup
                                    </Button>
                                    {/* Add more quick actions if needed */}
                                    <Button variant="outline" className="justify-start" onClick={() => setIsUploadDialogOpen(true)}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Restore from SQL File
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Backup History Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Backup History</CardTitle>
                            <CardDescription>A list of all created backups. Download or restore from here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {backups.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <Archive className="mb-3 h-10 w-10 opacity-20" />
                                    <p>No backups found</p>
                                </div>
                            ) : (
                                ''
                            )}
                            {backups.length > 0 && (
                                <DataTable
                                    data={backups}
                                    columns={[
                                        {
                                            key: 'filename',
                                            header: 'Filename',
                                            render: (row) => <span className="font-mono text-xs">{row.filename}</span>,
                                        },
                                        {
                                            key: 'backup_type',
                                            header: 'Type',
                                            render: (row) => (
                                                <Badge variant={row.backup_type === 1 ? 'default' : 'secondary'} className="text-[10px]">
                                                    {row.backup_type === 1 ? 'Full' : 'Partial'}
                                                </Badge>
                                            ),
                                        },
                                        {
                                            key: 'formatted_size',
                                            header: 'Size',
                                            render: (row) => <div className="text-left text-xs">{row.formatted_size}</div>,
                                        },
                                        {
                                            key: 'created_by_name',
                                            header: 'Created By',
                                            render: (row) => <span className="text-xs">{row.created_by_name}</span>,
                                        },
                                        {
                                            key: 'created_at',
                                            header: 'Date',
                                            render: (row) => <span className="text-xs text-muted-foreground">{row.created_at}</span>,
                                        },
                                        {
                                            key: 'actions',
                                            header: 'Actions',
                                            render: (row) => (
                                                <div className="justify-left flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleDownload(row)}
                                                        title="Download"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20"
                                                        onClick={() => openRestoreDialog(row)}
                                                        title="Restore"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                                                        onClick={() => openDeleteDialog(row)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ),
                                        },
                                    ]}
                                    searchable
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>

            {/* Backup Confirmation Dialog */}
            <CountdownConfirmDialog
                open={showBackupDialog}
                onOpenChange={setShowBackupDialog}
                title="Confirm Backup"
                message={
                    backupType === 'full' ? (
                        <>
                            You are about to create a <strong>full database backup</strong>. This will backup all application tables.
                            <br />
                            <br />
                            This operation may take a few moments depending on your database size.
                        </>
                    ) : (
                        <>
                            You are about to backup <strong>{selectedTables.length} selected table(s)</strong>:
                            <br />
                            <code className="mt-2 block max-h-20 overflow-auto rounded bg-muted p-2 text-xs">{selectedTables.join(', ')}</code>
                        </>
                    )
                }
                onConfirm={handleBackup}
                confirmLabel={isBackupLoading ? 'Creating...' : 'Create Backup'}
                variant="warning"
                loading={isBackupLoading}
                countdownSeconds={5}
            />

            {/* Restore Confirmation Dialog */}
            <CountdownConfirmDialog
                open={showRestoreDialog}
                onOpenChange={setShowRestoreDialog}
                title="Restore Database"
                message={
                    <div className="space-y-3 text-left">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Warning: Irreversible Action</AlertTitle>
                            <AlertDescription>This action cannot be undone. Current data will be overwritten.</AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                            <p>
                                You are about to restore from backup: <strong>{selectedBackup?.filename}</strong>
                            </p>
                            <p>
                                {selectedBackup?.backup_type === 1 ? (
                                    <>
                                        This will <strong className="text-destructive">DELETE ALL DATA</strong> in the database and replace it with
                                        data from the backup.
                                    </>
                                ) : (
                                    <>
                                        This will <strong className="text-destructive">REPLACE</strong> {selectedBackup?.tables_count} tables with
                                        data from the backup.
                                    </>
                                )}
                            </p>
                            <p className="text-xs">Please ensure you have created a fresh backup before proceeding.</p>
                        </div>
                    </div>
                }
                onConfirm={handleRestore}
                confirmLabel={isRestoreLoading ? 'Restoring...' : 'Restore Database'}
                variant="destructive"
                loading={isRestoreLoading}
                countdownSeconds={5}
            />

            {/* Upload Restore Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Restore from File</DialogTitle>
                        <DialogDescription>
                            Upload a .sql backup file to restore your database directly.
                            <br />
                            <span className="font-bold text-destructive">WARNING: This will overwrite your current database!</span>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUploadRestore} className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="backup-file">SQL File</Label>
                            <Input
                                id="backup-file"
                                type="file"
                                accept=".sql"
                                ref={fileInputRef}
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={isUploading || !uploadFile}>
                                {isUploading ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Restoring...
                                    </>
                                ) : (
                                    'Restore Database'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <CountdownConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Backup"
                message={
                    <>
                        Are you sure you want to delete backup <strong>{selectedBackup?.filename}</strong>?
                        <br />
                        <br />
                        This action cannot be undone. The backup file will be permanently removed.
                    </>
                }
                onConfirm={handleDelete}
                confirmLabel={isDeleteLoading ? 'Deleting...' : 'Delete Backup'}
                variant="destructive"
                loading={isDeleteLoading}
                countdownSeconds={5}
            />
        </AppLayout>
    );
}
