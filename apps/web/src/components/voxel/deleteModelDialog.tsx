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
  modelName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModelDialog: React.FC<Props> = ({
  modelName,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={modelName != null}>
      <AlertDialogContent className="rounded-4xl border-mauve bg-sidebar shadow-2xl p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black text-mauve text-center">
            Êtes-vous sûr ?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-lg">
            Cela supprimera définitivement ton modèle{' '}
            <span className="font-bold text-mauve">{modelName}</span>.
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

export default DeleteModelDialog;
