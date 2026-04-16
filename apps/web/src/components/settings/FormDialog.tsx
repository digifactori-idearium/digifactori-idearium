import { Form } from '@/components/common/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { integrationInputs } from '@/lib/input';
import { storeInputs } from '@/lib/input';

interface FormDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  inputs: typeof integrationInputs | typeof storeInputs;
  onsubmit: () => void;
  loading: boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  trigger,
  title,
  description,
  inputs,
  onsubmit,
  loading,
}) => (
  <Dialog>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent className="bg-sidebar">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <Form inputs={inputs} handleOnSubmit={onsubmit} loading={loading} />
    </DialogContent>
  </Dialog>
);
