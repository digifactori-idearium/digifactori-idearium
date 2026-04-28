import { type Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  const handleSort = () => {
    if (sorted === false)
      column.toggleSorting(false); // none → asc
    else if (sorted === 'asc')
      column.toggleSorting(true); // asc  → desc
    else column.clearSorting(); // desc → none
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSort}
        className="h-8 text-white! bg-mauve! hover:bg-mauve/80! border-mauve!"
      >
        <span>{title}</span>
        {sorted === 'desc' ? (
          <ArrowDown className="h-4 w-4" />
        ) : sorted === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        )}
      </Button>
    </div>
  );
}
