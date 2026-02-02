import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Role = {
    id: string;
    role_name: string;
};

type SearchableRoleSelectProps = {
    value: string;
    onValueChange: (value: string) => void;
    roles: Role[];
    error?: string;
    disabled?: boolean;
};

export function SearchableRoleSelect({ value, onValueChange, roles, error, disabled }: SearchableRoleSelectProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, errors, processing, reset } = useForm({
        role_name: '',
    });

    // Filter roles based on search query
    const filteredRoles = roles.filter((role) => role.role_name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Get selected role name
    const selectedRole = roles.find((role) => role.id === value);

    const handleCreateRole = () => {
        setIsOpen(false);
        setShowCreateDialog(true);
    };

    const handleSubmitRole = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        post(route('role.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateDialog(false);
                reset();
            },
        });
    };

    const handleSelectRole = (roleId: string) => {
        onValueChange(roleId);
        setIsOpen(false);
        setSearchQuery('');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!showCreateDialog) {
            reset();
        }
    }, [showCreateDialog, reset]);

    return (
        <>
            <div className="space-y-2">
                <div className="relative" ref={dropdownRef}>
                    {/* Trigger Button */}
                    <button
                        type="button"
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        disabled={disabled}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <span className={selectedRole ? '' : 'text-muted-foreground'}>{selectedRole ? selectedRole.role_name : 'Select role'}</span>
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </button>

                    {/* Dropdown Content */}
                    {isOpen && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in outline-none fade-in-0 zoom-in-95">
                            {/* Search Input */}
                            <div className="border-b p-2">
                                <Input
                                    placeholder="Search roles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8"
                                    autoFocus
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                            </div>

                            {/* Role List */}
                            <div className="max-h-[200px] overflow-y-auto p-1">
                                {filteredRoles.length > 0 ? (
                                    filteredRoles.map((role) => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => handleSelectRole(role.id)}
                                            className="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                        >
                                            <Check className={`mr-2 h-4 w-4 ${value === role.id ? 'opacity-100' : 'opacity-0'}`} />
                                            {role.role_name}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-2 text-center text-sm text-muted-foreground">No roles found</div>
                                )}
                            </div>

                            {/* Create New Role Button */}
                            {/* <div className="border-t p-1">
                                <Button type="button" variant="ghost" size="sm" className="w-full justify-start" onClick={handleCreateRole}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create New Role
                                </Button>
                            </div> */}
                        </div>
                    )}
                </div>
                {error && <InputError message={error} />}
            </div>

            {/* Create Role Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
                    <form onSubmit={handleSubmitRole}>
                        <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                            <DialogDescription>Add a new role to the system</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="role_name">
                                    Role Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="role_name"
                                    value={data.role_name}
                                    onChange={(e) => setData('role_name', e.target.value)}
                                    placeholder="Enter role name"
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.role_name} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Role'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
