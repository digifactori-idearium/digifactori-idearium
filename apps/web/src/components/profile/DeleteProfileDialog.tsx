import { Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface Props {
  pseudo: string;
  onConfirm: () => void;
}

const DeleteProfileDialog: React.FC<Props> = ({ pseudo, onConfirm }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div>
          <Button className=" w-8 h-8 flex justify-center items-center bg-red-300! text-red-700! rounded-full">
            <Trash2 className="w-6 h-6" />
          </Button>
        </div>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-4xl border-mauve bg-sidebar shadow-2xl p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black text-mauve text-center">
            Êtes-vous sûr ?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-lg">
            Cela supprimera définitivement le profil de{' '}
            <span className="font-bold text-mauve">{pseudo}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="form-button font-bold">
            Non
          </AlertDialogCancel>

          <AlertDialogAction onClick={onConfirm} className="danger-btn">
            Oui, supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProfileDialog;
