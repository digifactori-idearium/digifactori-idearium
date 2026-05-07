import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type FilterFn,
  ColumnFiltersState,
  VisibilityState,
  SortingState,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import * as React from 'react';

import { DataTablePagination } from './DataTablePagination';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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

const globalFilterFn: FilterFn<any> = (row, _columnId, filterValue) => {
  const search = String(filterValue).toLowerCase().trim();
  if (!search) return true;

  return row.getAllCells().some(cell => {
    if (
      cell.column.id === 'id' ||
      cell.column.id === 'select' ||
      cell.column.id === 'actions'
    )
      return false;
    const value = cell.getValue();
    if (value == null) return false;
    return String(value).toLowerCase().includes(search);
  });
};

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
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const serverPagination =
    pageCount !== undefined && onPageChange !== undefined;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndex ?? 0,
    pageSize: 20,
  });

  const [globalFilter, setGlobalFilter] = React.useState('');

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
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
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
    globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
  });

  useEffect(() => {
    setRowSelection({});
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="Rechercher..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="w-full sm:max-w-sm border-mauve/80!"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="ml-auto text-white! bg-mauve! hover:bg-mauve/80! border-mauve!">
              Colonnes
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={value => column.toggleVisibility(!!value)}
                >
                  {typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : ((column.columnDef.meta as any)?.label ?? column.id)}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
