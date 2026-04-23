import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SuperButton } from '../common/button';
import { DataTable } from '../common/data-table/dataTable';

import { UserDialog } from './UserDialog';
import { columns } from './usersColumns';

import {
  manageUserInputs,
  adminUserRole,
  supervisorUserRole,
} from '@/lib/input';
import { useUser } from '@/providers/UserProvider';
import { getUsers, deleteUser, createUser } from '@/services/user.service';

export default function UserHandling() {
  const [data, setData] = useState<User[]>([]);
  const { user: currentUser } = useUser();

  const [_loading, setLoading] = useState(false);

  const roleInput =
    currentUser?.role === 'ADMIN' ? adminUserRole : supervisorUserRole;

  const userInputs = [...manageUserInputs, roleInput];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      console.log(users);
      setData(users);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="container mx-auto h-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="magic-text md:text-5xl text-3xl font-bold">
          Gérez les stagiaires
        </h1>
      </div>

      <UserDialog
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
        loading={false}
        onsubmit={async data => {
          console.log(data);
          await createUser(data);
          toast.success('Utilisateur créé');
          fetchUsers();
        }}
      />

      {/* TABLE */}
      <div>
        <DataTable
          columns={columns(handleDelete, fetchUsers, currentUser)}
          data={data}
        />
      </div>
    </div>
  );
}
