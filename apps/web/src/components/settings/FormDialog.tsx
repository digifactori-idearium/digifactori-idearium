import { useState } from 'react';
import { FieldValues } from 'react-hook-form';

import { Form, FormInputData } from '@/components/common/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FormDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  inputs: FormInputData[];
  initialValues?: FieldValues;
  onsubmit: (data: any) => Promise<void>;
  loading: boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  trigger,
  title,
  description,
  inputs,
  onsubmit,
  initialValues,
  loading,
}) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      await onsubmit(data);
      setOpen(false);
    } catch {
      // error already handled by the caller (toast err)
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-sidebar z-110 flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-1">
          <Form
            inputs={inputs}
            handleOnSubmit={handleSubmit}
            loading={loading}
            initialValues={initialValues}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
