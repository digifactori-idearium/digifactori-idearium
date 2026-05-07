import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog as AlertDialogPrimtive,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
  trigger: React.ReactNode;
  description: React.ReactNode;
  confirmationMessage: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const AlertDialog: React.FC<Props> = ({
  trigger,
  description,
  confirmationMessage,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialogPrimtive>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="rounded-4xl border-mauve bg-sidebar shadow-2xl p-8 z-120">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black text-mauve text-center">
            Êtes-vous sûr ?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-lg">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="form-button font-bold border-0!"
            onClick={e => {
              e.stopPropagation();
              onCancel();
            }}
          >
            Annuler
          </AlertDialogCancel>

          <AlertDialogAction
            voiceMessage={confirmationMessage}
            className="danger-btn"
            onClick={e => {
              e.stopPropagation();
              onConfirm();
            }}
          >
            {confirmationMessage}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPrimtive>
  );
};

export default AlertDialog;
