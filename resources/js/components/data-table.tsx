import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
} from '@tanstack/react-table';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import * as React from 'react';

interface Column<TData> {
    key: string;
    header: string;
    render?: (row: TData, index: number) => React.ReactNode;
}

interface DataTableProps<TData> {
    data: TData[];
    columns: Column<TData>[];
    onCreate?: () => void;
    onEdit?: (row: TData) => void;
    onShow?: (row: TData) => void;
    onDelete?: (row: TData) => void;
    createLabel?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    onFilteredCountChange?: (count: number) => void;
}

export function DataTable<TData extends Record<string, unknown>>({
    data,
    columns,
    onCreate,
    onEdit,
    onShow,
    onDelete,
    createLabel = 'Create',
    searchable = false,
    searchPlaceholder = 'Search...',
    onFilteredCountChange,
}: DataTableProps<TData>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [globalFilter, setGlobalFilter] = React.useState('');

    // Convert custom columns to TanStack columns
    const tableColumns: ColumnDef<TData>[] = React.useMemo(
        () => [
            ...columns.map((col) => ({
                accessorKey: col.key,
                header: col.header,
                cell: ({ row }: any) => {
                    if (col.render) {
                        return col.render(row.original as TData, row.index);
                    }
                    return row.getValue(col.key);
                },
            })),
            // Actions column
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => {
                    const hasActions = onEdit || onShow || onDelete;
                    if (!hasActions) return null;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {onShow && <DropdownMenuItem onClick={() => onShow(row.original)}>View Details</DropdownMenuItem>}
                                {onEdit && <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>}
                                {onDelete && (
                                    <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-destructive">
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [columns, onEdit, onShow, onDelete],
    );

    const table = useReactTable({
        data,
        columns: tableColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter,
        },
    });

    const filteredCount = table.getFilteredRowModel().rows.length;

    React.useEffect(() => {
        if (onFilteredCountChange) {
            onFilteredCountChange(filteredCount);
        }
    }, [filteredCount, onFilteredCountChange]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                {searchable && (
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={globalFilter ?? ''}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="pl-8"
                        />
                    </div>
                )}
                {onCreate && (
                    <Button onClick={onCreate} className="ml-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        {createLabel}
                    </Button>
                )}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted text-muted-foreground hover:bg-muted">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                                    No matching records found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
