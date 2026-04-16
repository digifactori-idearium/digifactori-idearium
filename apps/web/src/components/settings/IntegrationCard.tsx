import { Trash2, SquarePen } from 'lucide-react';
import { useState } from 'react';

import DeleteIntegrationDialog from './DeleteIntegrationDialog';

import { FormDialog } from '@/components/settings/FormDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { integrationInputs } from '@/lib/input';

export const IntegrationCard: React.FC<Integration> = ({ name }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [loading, _setLoading] = useState(false);

  return (
    <Card className="bg-sidebar border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.05)] p-6 flex flex-col items-center relative group transition-transform duration-300 hover:scale-101">
      <div className="flex w-full items-center justify-start mb-8">
        <h3 className="font-bold uppercase tracking-tight ml-3">{name}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full mt-auto">
        <FormDialog
          trigger={
            <Button className="w-full text-white! bg-mauve! hover:bg-mauve/80! !border-mauve py-5">
              <SquarePen />
            </Button>
          }
          title="Modifier l'intégration"
          description="Modifiez les informations de l'intégration et cliquer sur
                      envoyer pour le sauvegarder."
          inputs={integrationInputs}
          onsubmit={() => {}}
          loading={loading}
        />

        <Button
          onClick={() => setDeleteDialogOpen(true)}
          className="w-full text-white! bg-red-400! hover:bg-red-400/80! !border-red-600 py-5"
        >
          <Trash2 />
        </Button>
        <DeleteIntegrationDialog
          open={deleteDialogOpen}
          onConfirm={() => {
            setDeleteDialogOpen(false);
          }}
          onCancel={() => {
            setDeleteDialogOpen(false);
          }}
        />
      </div>
    </Card>
  );
};
