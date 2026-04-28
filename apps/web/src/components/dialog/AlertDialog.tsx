
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialog as AlertDialogPrimtive,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  open: boolean,
  description: React.ReactNode,
  confirmationMessage: string,
  onConfirm: () => void;
  onCancel: () => void;
}

const AlertDialog: React.FC<Props> = ({ open, description, confirmationMessage, onConfirm, onCancel }) => {
  return (
    <AlertDialogPrimtive open={open}>
      <AlertDialogContent className="rounded-4xl border-mauve bg-sidebar shadow-2xl p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black text-mauve text-center">
            Êtes-vous sûr ?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-lg">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="form-button font-bold" onClick={onCancel}>
            Non
          </AlertDialogCancel>

          <AlertDialogAction onClick={(e) => {e.stopPropagation(); e.preventDefault(); onConfirm()}} className="danger-btn">
            {confirmationMessage}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPrimtive>
  );
};

export default AlertDialog;
