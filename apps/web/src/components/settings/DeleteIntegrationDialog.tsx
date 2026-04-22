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
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteIntegrationDialog: React.FC<Props> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="rounded-4xl border-mauve bg-sidebar shadow-2xl p-8 z-110">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black text-mauve text-center">
            Êtes-vous sûr ?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-lg">
            Cela supprimera l'intégration.
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

export default DeleteIntegrationDialog;
