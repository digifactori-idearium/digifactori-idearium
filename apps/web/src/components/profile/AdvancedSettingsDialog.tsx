import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { SuperButton } from '../common/button/SuperButton';
import DeleteProfileDialog from '../dialog/AlertDialog';

import { Form } from '@/components/common/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUser } from '@/providers/UserProvider';
import { getUser } from '@/services/profile.service';

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
  const { user: sessionUser, removeToken } = useUser();

  const [user, setUser] = useState<any>();
  const [open, setOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(sessionUser?.role !== 'INTERN');
  const [code, setCode] = useState('');

  const effectiveUser = propUser || user;

  const handleUnlock = async () => {
    try {
      const response = await getUser(code);
      if (response.data.user) {
        setUser(response.data.user);
        setIsUnlocked(true);
        toast.success('Accès autorisé');
      } else {
        toast.error('Code parental incorrect');
      }
    } catch {
      toast.error('Code parental incorrect');
    }
  };

  const handleFormSubmit = async (formData: any) => {
    const userData = { ...formData };
    await onUpdate(userData, profile);
    setOpen(false);
    removeToken();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={val => {
        setOpen(val);
        if (!val) {
          setIsUnlocked(sessionUser?.role !== 'INTERN');
          setCode('');
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] z-110 flex flex-col bg-sidebar! border-mauve! dialog-btn">
        <DialogHeader>
          <DialogTitle>
            {isUnlocked ? 'Paramètres du compte' : 'Code Parental Requis'}
          </DialogTitle>
        </DialogHeader>

        {isUnlocked && effectiveUser && (
          <div className="absolute top-5 right-16">
            <DeleteProfileDialog
              trigger={
                <SuperButton
                  className="w-8 h-8 flex justify-center items-center bg-red-300! text-red-700! rounded-full"
                  tooltip="Supprimer votre profile"
                  voiceText="Supprimer votre profile"
                >
                  <Trash2 className="w-6 h-6" />
                </SuperButton>
              }
              description={
                <>
                  Cela supprimera définitivement le profil de{' '}
                  <span className="font-bold text-mauve">{profile.pseudo}</span>
                  .
                </>
              }
              confirmationMessage="Oui, supprimer"
              onConfirm={onDelete}
              onCancel={() => {}}
            />
          </div>
        )}

        <div className="z-1 flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
                  ]}
                  initialValues={{
                    email: effectiveUser?.email || '',
                    first_name: effectiveUser?.first_name || '',
                    last_name: effectiveUser?.last_name || '',
                    role: effectiveUser?.role || '',
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
            <div className="flex flex-col gap-4 py-4">
              <Input
                type="password"
                placeholder="0 0 0 0"
                maxLength={4}
                className="my-4 text-center text-lg"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
              <Button
                type="button"
                disabled={false}
                onClick={handleUnlock}
                className="w-full text-foreground! bg-mauve!"
              >
                Déverrouiller
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSettingsDialog;
