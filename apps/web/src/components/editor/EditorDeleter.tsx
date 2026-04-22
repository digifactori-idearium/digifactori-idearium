import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  open: boolean;
  editor: string;
  onConfirm: () => void;
  onCancle: () => void;
}

export const EditorDeleter: React.FC<Props> = ({
  open,
  editor,
  onConfirm,
  onCancle,
}) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="rounded-4xl border-mauve bg-sidebar shadow-2xl p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black text-mauve text-center">
            Êtes-vous sûr ?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-lg">
            Cela supprimera définitivement le document{' '}
            <span className="font-bold text-mauve">{editor}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="form-button font-bold"
            onClick={e => {
              e.stopPropagation();
              onCancle();
            }}
          >
            Non
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              onConfirm();
              toast.success('Document Supprimer');
            }}
            className="danger-btn"
          >
            Oui, supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
