import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { DataTablePagination } from './DataTablePagination';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  pageCount?: number;
  pageIndex?: number;
  onPageChange?: (pageIndex: number) => void;
  onSelectedRowsChange?: (rows: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  pageCount,
  pageIndex,
  onPageChange,
  onSelectedRowsChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const serverPagination =
    pageCount !== undefined && onPageChange !== undefined;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndex ?? 0,
    pageSize: 20,
  });

  const controlledPagination: PaginationState = serverPagination
    ? { pageIndex: pageIndex!, pageSize: pagination.pageSize }
    : pagination;

  const handlePaginationChange: OnChangeFn<PaginationState> = updater => {
    const next =
      typeof updater === 'function' ? updater(controlledPagination) : updater;

    if (serverPagination) {
      if (next.pageIndex !== pageIndex) {
        onPageChange!(next.pageIndex);
      }
    } else {
      setPagination(next);
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      pagination: controlledPagination,
    },
    // api pagination
    manualPagination: serverPagination,
    pageCount: serverPagination ? pageCount : undefined,
    // Handlers
    getRowId: (row: any) => row.id,
    onRowSelectionChange: updater => {
      const newSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      if (onSelectedRowsChange) {
        const selectedIds = new Set(
          Object.keys(newSelection).filter(k => newSelection[k])
        );
        const selectedRows = data.filter((row: any) => selectedIds.has(row.id));
        onSelectedRowsChange(selectedRows);
      }
    },
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    setRowSelection({});
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Chargement…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {serverPagination && <DataTablePagination table={table} />}
    </div>
  );
}
