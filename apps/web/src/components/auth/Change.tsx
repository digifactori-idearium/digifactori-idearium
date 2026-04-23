import { UserLock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { SuperButton } from '../common/button';

import { Form } from '@/components/common/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { changePasswordInputs } from '@/lib/input';
import { changePassword } from '@/services/auth.service';

export const ChangePasswordDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);

      await changePassword(
        data.currentPassword,
        data.newPassword,
        data.confirmPassword
      );

      toast.success('Mot de passe modifié avec succès');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SuperButton className="flex items-center gap-2 form-button">
          <UserLock className="w-4 h-4" />
          changement mot de passe
        </SuperButton>
      </DialogTrigger>

      <DialogContent className="bg-sidebar z-50 flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Modifier votre mot de passe</DialogTitle>
          <DialogDescription>
            Vous pouvez modifier votre mot de passe à l'aide de celui que vous
            utilisez actuellement
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-1">
          <Form
            inputs={changePasswordInputs}
            handleOnSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
