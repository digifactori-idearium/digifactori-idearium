import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import DeleteProfileDialog from './DeleteProfileDialog';

import Form from '@/components/global/Form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUser } from '@/providers/UserProvider';
import { getProfile } from '@/services/profile.service';

interface AdvancedDialogProps {
  user?: any;
  profile: any;
  onUpdate: (user: any, profile: any) => Promise<void>;
  onDelete: () => void;
  children: React.ReactNode;
}

const AdvancedSettingsDialog: React.FC<AdvancedDialogProps> = ({
  user: propUser,
  profile,
  onUpdate,
  onDelete,
  children,
}) => {
  const { getUser, removeToken } = useUser();
  const [user, setUser] = useState<any>();
  const [open, setOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(getUser()?.role !== 'CHILD');
  const [code, setCode] = useState('');

  const effectiveUser = propUser || user;

  const handleUnlock = async () => {
    try {
      const response = await getProfile(code);
      if (response.data?.user) {
        setUser(response.data?.user);
        setIsUnlocked(true);
        toast.success('Accès autorisé');
      }
    } catch {
      toast.error('Code parental incorrect');
    }
  };

  const handleFormSubmit = async (formData: any) => {
    const userData = { ...formData };

    if (userData.parental_code === '****' || !userData.parental_code.trim()) {
      delete userData.parental_code;
    }

    try {
      await onUpdate(userData, profile);

      if (
        getUser()?.role &&
        formData.role &&
        getUser()?.role !== formData.role
      ) {
        toast.success('Rôle mis à jour. Veuillez vous reconnecter.');
        removeToken();
        return;
      }

      toast.success('Paramètres mis à jour');
      setOpen(false);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={val => {
        setOpen(val);
        if (!val) {
          setIsUnlocked(getUser()?.role !== 'CHILD');
          setCode('');
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden bg-sidebar! border-mauve! [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            {isUnlocked ? 'Paramètres du compte' : 'Code Parental Requis'}
          </DialogTitle>
        </DialogHeader>

        {isUnlocked && effectiveUser && (
          <div className="absolute top-3 right-14">
            <DeleteProfileDialog pseudo={profile.pseudo} onConfirm={onDelete} />
          </div>
        )}

        <DialogClose
          className="absolute w-8 h-8 flex justify-center items-center top-3 right-3 text-white hover:text-white/80 bg-mauve! rounded-full"
          asChild
        >
          <X className="w-6 h-6" />
        </DialogClose>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {isUnlocked ? (
            effectiveUser ? (
              <div className="p-3">
                <Form
                  inputs={[
                    {
                      label: 'Email',
                      type: 'email',
                      name: 'email',
                      required: true,
                    },
                    { label: 'Prénom', type: 'text', name: 'first_name' },
                    { label: 'Nom', type: 'text', name: 'last_name' },
                    {
                      label: 'Rôle',
                      type: 'select',
                      name: 'role',
                      options: [
                        { text: 'Enfant', value: 'CHILD' },
                        { text: 'Superviseur', value: 'SUPERVISOR' },
                      ],
                    },
                    {
                      label: 'Changer Code Parental',
                      type: 'text',
                      name: 'parental_code',
                    },
                  ]}
                  initialValues={{
                    email: effectiveUser?.email || '',
                    first_name: effectiveUser?.first_name || '',
                    last_name: effectiveUser?.last_name || '',
                    role: effectiveUser?.role || '',
                    parental_code: effectiveUser?.parental_code ? '****' : '',
                  }}
                  handleOnSubmit={handleFormSubmit}
                />
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Aucune donnée utilisateur disponible
              </div>
            )
          ) : (
            <>
              <Input
                type="password"
                placeholder="0 0 0 0"
                maxLength={4}
                className="my-4 text-center text-lg"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
              <Button
                onClick={handleUnlock}
                className="w-full text-foreground!"
              >
                Déverrouiller
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSettingsDialog;
