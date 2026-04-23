import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { UserDeleteDialog } from './UserDeleteDialog';
import { UserDialog } from './UserDialog';

import { Checkbox } from '@/components/ui/checkbox';
import { adminUserInputs } from '@/lib/input';
import { updateUser } from '@/services/user.service';

export const columns = (
  onDelete: (id: string) => void,
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
      const isSelf = currentUser!.id === user.id;

      if (isSelf) return null;

      return (
        <div className="flex items-center gap-2">
          <UserDialog
            trigger={
              <button
                className="p-2 rounded-full hover:bg-mauve/30 bg-mauve/10 text-mauve transition-colors"
                title="Modifier"
              >
                <Pencil className="h-4 w-4" />
              </button>
            }
            title="Modifier utilisateur"
            description="Modifier les informations de l'utilisateur"
            inputs={adminUserInputs}
            initialValues={{
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              pseudo: user.profile?.pseudo,
              role: user.role,
            }}
            loading={false}
            onsubmit={async data => {
              await updateUser(user.id, data);
              toast.success('Utilisateur mis à jour');
              refresh();
            }}
          />

          <UserDeleteDialog
            trigger={
              <button
                className="p-2 rounded-full  hover:bg-red-500/30 bg-red-500/10 text-red-500 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            }
            pseudo={user.profile?.pseudo}
            onConfirm={() => onDelete(user.id)}
            onCancel={() => {}}
          />
        </div>
      );
    },
  },
];
