import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { UserDeleteDialog } from './UserDeleteDialog';

import { FormDialog } from '@/components/common/form/FormDialog';
import {
  manageUserInputs,
  adminUserRole,
  supervisorUserRole,
} from '@/lib/input';
import { deleteUser, updateUser } from '@/services/user.service';

interface UserActionsProps {
  user: any;
  currentUser: any;
  refresh: () => void;
}

export const UserActions = ({
  user,
  currentUser,
  refresh,
}: UserActionsProps) => {
  const [loading, setLoading] = useState(false);

  const isSelf = currentUser?.id === user.id;
  const roleInput =
    currentUser?.role === 'ADMIN' ? adminUserRole : supervisorUserRole;
  const userInputs = [...manageUserInputs, roleInput];

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      await updateUser(user.id, data);
      toast.success('Utilisateur mis à jour');
      refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(user.id);
      toast.success('Utilisateur supprimé');
      refresh();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (isSelf) return null;

  return (
    <div className="flex items-center gap-2">
      <FormDialog
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
        inputs={userInputs}
        initialValues={{
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          pseudo: user.profile?.pseudo,
          role: user.role,
        }}
        loading={loading}
        onsubmit={handleSubmit}
      />

      <UserDeleteDialog
        trigger={
          <button
            className="p-2 rounded-full hover:bg-red-500/30 bg-red-500/10 text-red-500 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        }
        pseudo={user.profile?.pseudo}
        onConfirm={handleDelete}
        onCancel={() => {}}
      />
    </div>
  );
};
