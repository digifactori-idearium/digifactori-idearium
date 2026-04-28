import { ColumnDef } from '@tanstack/react-table';

import { AssetPreview } from '../assets/AssetPreview';

import { AssetActions } from './assetActions';

import { Checkbox } from '@/components/ui/checkbox';

export const columns = (refresh: () => void): ColumnDef<Asset>[] => [
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
    accessorKey: 'type',
    header: 'Type',
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
        <AssetPreview name={asset.name} url={asset.preview}></AssetPreview>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const asset = row.original;
      return <AssetActions asset={asset} refresh={refresh} />;
    },
  },
];
