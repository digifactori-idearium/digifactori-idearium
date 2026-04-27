import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { columns } from './usersColumns';

import { SuperButton } from '@/components/common/button';
import { DataTable } from '@/components/common/data-table/dataTable';
import { FormDialog } from '@/components/common/form/FormDialog';
import {
  manageUserInputs,
  adminUserRole,
  supervisorUserRole,
} from '@/lib/input';
import { useUser } from '@/providers/UserProvider';
import { getUsers, createUser } from '@/services/user.service';

export default function UserHandling() {
  const [data, setData] = useState<User[]>([]);
  const { user: currentUser } = useUser();

  const [loading, setLoading] = useState(false);

  const roleInput =
    currentUser?.role === 'ADMIN' ? adminUserRole : supervisorUserRole;

  const userInputs = [...manageUserInputs, roleInput];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      setData(users);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto h-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="magic-text md:text-5xl text-3xl font-bold">
          Gérez les stagiaires
        </h1>
      </div>

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

      {/* TABLE */}
      <div>
        <DataTable columns={columns(fetchUsers, currentUser)} data={data} />
      </div>
    </div>
  );
}
