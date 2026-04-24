import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Form } from '@/components/common/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { assetInputs } from '@/lib/input';

const ActionsCells = ({ row }: { row: any }) => {
  const [open, setOpen] = useState(false);
  const [loading, _setLoading] = useState(false);

  const asset = row.original;

  return (
    <>
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
            onClick={() => navigator.clipboard.writeText(asset.name)}
          >
            Copier le nom de l'asset
          </DropdownMenuItem>
          <DropdownMenuItem>Supprimer l'asset</DropdownMenuItem>
          <DropdownMenuItem onSelect={e => e.preventDefault()}>
            <span onClick={() => setOpen(true)}>Modifier l'asset</span>{' '}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-sidebar ">
          <DialogHeader>
            <DialogTitle>Modifier l'asset</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'asset et cliquer sur envoyer pour
              le sauvegarder.
            </DialogDescription>
          </DialogHeader>
          <Form
            inputs={assetInputs}
            handleOnSubmit={() => {}}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export const columns: ColumnDef<Asset>[] = [
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
    accessorKey: 'name',
    header: 'Nom',
  },
  {
    accessorKey: 'category',
    header: 'Catégorie',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'preview',
    header: 'Aperçu',
    cell: ({ row }: { row: any }) => {
      const asset = row.original;

      return (
        <div className="w-24 h-24">
          <Card className="bg-sidebar overflow-hidden border-mauve/20 shadow-sm h-full">
            <CardContent className="p-0 h-full">
              <img
                src={asset.preview}
                alt="Asset preview"
                className="w-full h-full object-cover"
              />
            </CardContent>
          </Card>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: { row: any }) => <ActionsCells row={row} />,
  },
];
