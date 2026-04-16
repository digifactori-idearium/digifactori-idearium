import { useState } from 'react';

import { FormDialog } from '@/components/settings/FormDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { integrationInputs } from '@/lib/input';

export const NewIntegrationCard: React.FC = () => {
  const [loading, _setLoading] = useState(false);

  return (
    <Card className="flex flex-col items-center p-6 bg-transparent border-dashed border-muted-foreground/20 relative group transition-transform duration-300 hover:scale-101">
      <div className="w-10 h-10 flex items-center justify-center text-muted-foreground mb-8">
        <span className="text-4xl leading-none">+</span>
      </div>
      <div className="mt-auto w-full">
        <FormDialog
          trigger={
            <Button className="w-full text-white! bg-mauve! hover:bg-mauve/80! !border-mauve uppercase text-xs font-bold px-6 py-5">
              Nouvelle intégration
            </Button>
          }
          title="Ajouter une intégration"
          description="Complétez les informations de la nouvelle intégration et
                  cliquer sur envoyer pour le sauvegarder."
          inputs={integrationInputs}
          onsubmit={() => {}}
          loading={loading}
        />
      </div>
    </Card>
  );
};
