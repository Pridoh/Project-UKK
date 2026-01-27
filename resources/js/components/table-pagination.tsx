import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

interface TablePaginationProps {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number | null;
    to: number | null;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
}

export function TablePagination({ currentPage, lastPage, perPage, total, from, to, onPageChange, onPerPageChange }: TablePaginationProps) {
    const generatePageNumbers = (): (number | 'ellipsis')[] => {
        if (lastPage <= 7) {
            return Array.from({ length: lastPage }, (_, i) => i + 1);
        }

        const pages: (number | 'ellipsis')[] = [];

        // Always show first page
        pages.push(1);

        // Calculate range around current page
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(lastPage - 1, currentPage + 1);

        // Add ellipsis after first page if needed
        if (startPage > 2) {
            pages.push('ellipsis');
        }

        // Add pages around current page
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Add ellipsis before last page if needed
        if (endPage < lastPage - 1) {
            pages.push('ellipsis');
        }

        // Always show last page
        if (lastPage > 1) {
            pages.push(lastPage);
        }

        return pages;
    };

    const pages = generatePageNumbers();

    return (
        <div className="mt-3 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1">
                Showing <span className="font-medium">{from || 0}</span> - <span className="font-medium">{to || 0}</span> of{' '}
                <span className="font-medium">{total}</span> entries
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    <span>Show</span>
                    <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
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

                <div className="flex items-center gap-1">
                    {/* First Page */}
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
                        <ChevronsLeft className="h-4 w-4" />
                        <span className="sr-only">First page</span>
                    </Button>

                    {/* Previous Page */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous page</span>
                    </Button>

                    {/* Page Numbers */}
                    {pages.map((page, index) =>
                        page === 'ellipsis' ? (
                            <Button key={`ellipsis-${index}`} variant="ghost" size="icon" className="h-8 w-8" disabled>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </Button>
                        ),
                    )}

                    {/* Next Page */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === lastPage}
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next page</span>
                    </Button>

                    {/* Last Page */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(lastPage)}
                        disabled={currentPage === lastPage}
                    >
                        <ChevronsRight className="h-4 w-4" />
                        <span className="sr-only">Last page</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
