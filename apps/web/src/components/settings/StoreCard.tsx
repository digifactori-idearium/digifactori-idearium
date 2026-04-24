import { SquarePen, Database } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { CurrentStatus } from '@/components/settings/CurrentStatus';
import { FormDialog } from '@/components/common/form/FormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { storeInputs } from '@/lib/input';
import { updateStoreSettings } from '@/services/settings.service';

interface StoreCardProps {
  store: Settings | null;
  onUpdated?: () => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onUpdated }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Partial<Settings>) => {
    try {
      setLoading(true);
      await updateStoreSettings(data);
      onUpdated?.();
      toast.success('Reussite de la configuration du store');
    } catch (error: any) {
      toast.error(error?.message || 'Échec de la configuration du store');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden bg-sidebar border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-white shadow-sm overflow-hidden">
              <Database className="w-10 h-10 text-mauve" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
              {store?.storeName || 'Non défini'}
            </h3>

            <CurrentStatus status={store?.storeURL ? 'existing' : 'error'} />

            <h3 className="text-muted-foreground/60 mt-1">
              {store?.storeURL ? '********************' : ''}
            </h3>
          </div>

          <div className="w-full sm:w-auto ml-auto">
            <FormDialog
              trigger={
                <Button className="w-full sm:w-auto text-white! bg-mauve! hover:bg-mauve/80! border-mauve! uppercase text-xs font-bold px-6 py-5">
                  <SquarePen /> Mettre à jour la store
                </Button>
              }
              title="Modifier le store"
              description="Modifiez les informations du store..."
              inputs={storeInputs}
              initialValues={store ?? undefined}
              onsubmit={handleSubmit}
              loading={loading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
