import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Form } from '@/components/common/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ideoramaCreationInputs } from '@/lib/input';
import { createIdeorama } from '@/services/ideorama.service';

const IdeoramaCreator: React.FC<{
  isOpen: boolean;
  setIsOpen: any;
}> = ({ isOpen, setIsOpen }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: FieldValues): Promise<boolean | void> => {
    try {
      setLoading(true);
      const response = await createIdeorama(data.name);
      navigate(`/app/ideorama/${response.data.id}`);
      setIsOpen(false);
      toast.success("Création de l'idéorama réussie");
    } catch (error: any) {
      toast.error(error?.message || "Échec de la création de l'idéorama");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden bg-sidebar! border-mauve! dialog-btn">
        <DialogHeader className="shrink-0">
          <DialogTitle>Choisis le nom de ton nouveau idéorama</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <Form
            inputs={ideoramaCreationInputs}
            handleOnSubmit={onSubmit}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { IdeoramaCreator };

