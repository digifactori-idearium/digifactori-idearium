import { useState } from 'react';
import { SubmitHandler, FieldValues } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Form } from '@/components/common/form/Form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { modelCreationInputs } from '@/lib/input';
import { createVoxelModel } from '@/services/voxel.service';

const VoxelModelCreator: React.FC<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit: SubmitHandler<FieldValues> = async data => {
    try {
      setLoading(true);
      const response = await createVoxelModel(data.name);
      navigate(`/app/voxel/${response.data.id}`);
      setIsOpen(false);
      toast.success('Création du modèle réussie');
    } catch (error: any) {
      toast.error(error?.message || 'Échec de la création du modèle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden bg-sidebar! border-mauve! dialog-btn">
        <DialogHeader className="shrink-0">
          <DialogTitle>Choisis le nom de ton nouveau modèle</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <Form
            inputs={modelCreationInputs}
            handleOnSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { VoxelModelCreator };
