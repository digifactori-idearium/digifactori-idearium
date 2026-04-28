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
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AssetDeleteDialog: React.FC<Props> = ({
  trigger,
  name,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="rounded-4xl border-mauve bg-sidebar shadow-2xl p-8 z-120">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black text-mauve text-center">
            Êtes-vous sûr ?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-lg break-all overflow-hidden">
            Cela supprimera définitivement l'asset.{' '}
            <span className="font-bold text-mauve">{name}</span>.
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
