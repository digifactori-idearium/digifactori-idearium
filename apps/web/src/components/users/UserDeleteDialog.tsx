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

interface Props {
  trigger: React.ReactNode;
  pseudo?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UserDeleteDialog: React.FC<Props> = ({
  trigger,
  pseudo,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="rounded-4xl border-mauve bg-sidebar shadow-2xl p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black text-mauve text-center">
            Êtes-vous sûr ?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-lg">
            Cela supprimera définitivement l'utilisateur
            <span className="font-bold text-mauve">{pseudo}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="form-button font-bold"
            onClick={onCancel}
          >
            Non
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              onConfirm();
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
