import { useState } from 'react';
import { toast } from 'sonner';

import { FormDialog } from '@/components/settings/FormDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { integrationInputs } from '@/lib/input';
import { createIntegration } from '@/services/settings.service';

interface Props {
  onCreated?: () => void;
}

export const NewIntegrationCard: React.FC<Props> = ({ onCreated }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createIntegration(data);
      toast.success('Intégration créée avec succès');
      onCreated?.();
    } catch (error: any) {
      toast.error(error?.message || "Échec de la création de l'intégration");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col gap-8 items-center p-6 bg-transparent border-dashed border-muted-foreground/20 relative group transition-transform duration-300 hover:scale-101">
      <div className="w-10 h-10 flex flex-col items-center justify-center text-muted-foreground">
        <span className="text-4xl leading-none">+</span>
      </div>
      <span className="text-sm leading-none text-center">
        Ajouter une API d'asset 3d, de musique ou autre
      </span>
      <div className="w-full border-t border-white/10" />
      <div className="mt-auto w-full">
        <FormDialog
          trigger={
            <Button className="w-full text-white! bg-mauve! hover:bg-mauve/80! border-mauve! uppercase text-xs font-bold px-6 py-5">
              Nouvelle intégration
            </Button>
          }
          title="Ajouter une intégration"
          description="Complétez les informations..."
          inputs={integrationInputs}
          onsubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </Card>
  );
};
