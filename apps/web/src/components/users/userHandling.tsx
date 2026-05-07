import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { columns } from './usersColumns';

import { SuperButton } from '@/components/common/button';
import { DataTable } from '@/components/common/data-table/dataTable';
import { FormDialog } from '@/components/common/form/FormDialog';
import UserDeleteDialog from '@/components/dialog/AlertDialog';
import {
  manageUserInputs,
  adminUserRole,
  supervisorUserRole,
} from '@/lib/input';
import { useUser } from '@/providers/UserProvider';
import { getUsers, createUser, bulkDeleteUsers } from '@/services/user.service';

export default function UserHandling() {
  const [data, setData] = useState<User[]>([]);
  const { user: currentUser } = useUser();

  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const isAdmin = currentUser?.role === 'ADMIN';

  const roleInput = isAdmin ? adminUserRole : supervisorUserRole;

  const userInputs = [...manageUserInputs, roleInput];

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      setData(users);
      setSelectedUserIds([]);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = async (data: CreateUserInput) => {
    try {
      setLoading(true);
      await createUser(data);
      toast.success('Utilisateur créé');
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || 'Utilisateur non créé');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = useCallback(async () => {
    if (selectedUserIds.length === 0) {
      toast.error('Aucun utilisateur sélectionné');
      return;
    }

    try {
      const result = await bulkDeleteUsers(selectedUserIds);

      if (result.failed.length > 0) {
        toast.warning(
          `${result.deleted} supprimé(s) · ${result.failed.length} échec(s)`
        );
      } else {
        toast.success(`${result.deleted} utilisateur(s) supprimé(s)`);
      }

      setSelectedUserIds([]);
      fetchUsers();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }, [selectedUserIds, fetchUsers]);

  const handleSelectedRowsChange = useCallback((selectedRows: User[]) => {
    const ids = selectedRows.map(user => user.id);
    setSelectedUserIds(ids);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="container mx-auto h-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="magic-text md:text-5xl text-3xl font-bold">
          Gérez les {` ${isAdmin ? 'utilisateurs' : 'stagiaires'}`}
        </h1>
      </div>

      <div className="container mx-auto">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-4">
          <FormDialog
            trigger={
              <SuperButton
                voiceText={"Le paramètre avancé, c'est pour les grands."}
                className="flex items-center gap-2 form-button"
              >
                <Plus className="w-4 h-4" />
                Créer un utilisateur
              </SuperButton>
            }
            title="Créer un utilisateur"
            description="Ajouter un nouvel utilisateur"
            inputs={userInputs}
            loading={loading}
            onsubmit={handleCreate}
          />

          {selectedUserIds.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {selectedUserIds.length} utilisateur(s) sélectionné(s)
              </span>
              <UserDeleteDialog
                trigger={
                  <button
                    className="p-2 rounded-md hover:bg-red-500/70 bg-red-500/60 text-white transition-colors"
                    title="Supprimer"
                  >
                    Supprimer la sélection
                  </button>
                }
                description={`Êtes-vous sûr de vouloir supprimer ${selectedUserIds.length} utilisateur(s) ? Cette action est irréversible.`}
                confirmationMessage="Oui, supprimer"
                onConfirm={handleDeleteSelected}
                onCancel={() => {}}
              />
            </div>
          )}
        </div>

        {/* TABLE */}
        <div>
          <DataTable
            columns={columns(fetchUsers, currentUser)}
            data={data}
            loading={loading}
            onSelectedRowsChange={handleSelectedRowsChange}
          />
        </div>
      </div>
    </div>
  );
}
