import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { DataTableColumnHeader } from '../global/data-table/dataTableColumnHeader';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const columns: ColumnDef<Profile>[] = [
  {
    id: 'select',
    header: ({ table }: { table: any }) => (
      <Checkbox
        className="
          !h-5 !w-5
          flex justify-center items-center
          !border-1 !border-mauve
          !bg-transparent 
          data-[state=checked]:!bg-mauve
          data-[state=indeterminate]:!bg-mauve
          data-[state=checked]:!border-mauve
          data-[state=indeterminate]:!border-mauve
          data-[state=checked]:!text-white
          data-[state=indeterminate]:!text-white
          [&>svg]:!text-white
        "
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }: { row: any }) => (
      <Checkbox
        className="
          !h-5 !w-5
          flex justify-center items-center
          !border-1 !border-mauve
          data-[state=checked]:!bg-mauve
          data-[state=checked]:!border-mauve
          data-[state=checked]:!text-white
          data-[state=unchecked]:!bg-transparent
          data-[state=unchecked]:!border-mauve
          [&>svg]:!text-white
        "
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'id',
  },
  {
    accessorKey: 'userId',
    header: 'user id',
  },
  {
    accessorKey: 'pseudo',
    header: 'pseudo',
  },
  {
    accessorKey: 'avatar',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="email" />
    ),
    meta: { label: 'Email' },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date de création',
    cell: ({ row }: { row: any }) => {
      const date = new Date(row.getValue('createdAt') as string);

      const formatted = new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(date);

      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Date de mise à jour',
    cell: ({ row }: { row: any }) => {
      const date = new Date(row.getValue('updatedAt') as string);

      const formatted = new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(date);

      return <div>{formatted}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }: { row: any }) => {
      const profile = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-white! bg-mauve! hover:bg-mauve/80! !border-mauve"
            >
              <span className="sr-only  ">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(profile.userId)}
            >
              Copier l'id du profil
            </DropdownMenuItem>
            <DropdownMenuItem>Voir le profil</DropdownMenuItem>
            <DropdownMenuItem>Supprimer le profil</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
