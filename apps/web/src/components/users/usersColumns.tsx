import { ColumnDef } from '@tanstack/react-table';

import { UserActions } from './UserActions';

import { Checkbox } from '@/components/ui/checkbox';

export const columns = (
  refresh: () => void,
  currentUser: UserSession | null
): ColumnDef<User>[] => [
  {
    id: 'select',
    header: ({ table }: { table: any }) => (
      <Checkbox
        className="
          h-5! w-5!
          flex justify-center items-center
          border! border-mauve!
          bg-transparent! 
          data-[state=checked]:bg-mauve!
          data-[state=indeterminate]:bg-mauve!
          data-[state=checked]:border-mauve!
          data-[state=indeterminate]:border-mauve!
          data-[state=checked]:text-white!
          data-[state=indeterminate]:text-white!
          [&>svg]:text-white!
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
          h-5! w-5!
          flex justify-center items-center
          border! border-mauve!
          data-[state=checked]:bg-mauve!
          data-[state=checked]:border-mauve!
          data-[state=checked]:text-white!
          data-[state=unchecked]:bg-transparent!
          data-[state=unchecked]:border-mauve!
          [&>svg]:text-white!
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
    header: 'ID',
  },
  {
    accessorKey: 'profile.pseudo',
    header: 'Pseudo',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'first_name',
    header: 'Prénom',
  },
  {
    accessorKey: 'last_name',
    header: 'Nom',
  },
  {
    accessorKey: 'role',
    header: 'Rôle',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <UserActions user={user} currentUser={currentUser} refresh={refresh} />
      );
    },
  },
];
