import { FieldValues, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { Form } from '@/components/common/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDocumentList } from '@/hooks/editor';
import { EMOJIS, COLORS } from '@/lib/editor';
import { editorCreationInputs } from '@/lib/input';

const randomEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export const EditorCreator: React.FC<{
  isOpen: boolean;
  setIsOpen: any;
  userId: string;
  onOpen: (id: string) => void;
}> = ({ isOpen, setIsOpen, userId, onOpen }) => {
  const { loading, createDocument } = useDocumentList();

  const onSubmit: SubmitHandler<FieldValues> = async data => {
    try {
      const id = await createDocument({
        userId,
        title: data.title || 'SanS Titre',
        emoji: data.emoji || randomEmoji(),
        color: data.color || randomColor(),
      });
      onOpen(id);
      setIsOpen(false);
      toast.success('Création du document réussie');
    } catch (error: any) {
      toast.error(error?.message || 'Échec de la création du document');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden bg-sidebar! border-mauve! dialog-btn">
        <DialogHeader className="shrink-0">
          <DialogTitle>Cree de ton nouveau document</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <Form
            inputs={editorCreationInputs}
            handleOnSubmit={onSubmit}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
