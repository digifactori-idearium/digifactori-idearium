import { type Table } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col items-center gap-2 px-2 sm:flex-row sm:justify-between">
      <div className="text-sm text-muted-foreground text-center sm:text-left">
        {table.getFilteredSelectedRowModel().rows.length} ligne(s)
        sélectionnée(s) sur {table.getFilteredRowModel().rows.length}.
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm font-medium whitespace-nowrap">
          Page {table.getState().pagination.pageIndex + 1} sur{' '}
          {table.getPageCount()}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex justify-center items-center py-6 text-white! bg-mauve! hover:bg-mauve/80! rounded-4xl! border-mauve!"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Aller à la première page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 flex justify-center items-center py-6 text-white! bg-mauve! hover:bg-mauve/80! rounded-4xl! border-mauve!"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Aller à la page précédente</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 flex justify-center items-center py-6 text-white! bg-mauve! hover:bg-mauve/80! rounded-4xl! border-mauve!"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Aller à la page suivante</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex justify-center items-center py-6 text-white! bg-mauve! hover:bg-mauve/80! rounded-4xl! border-mauve!"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Aller à la dernière page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
