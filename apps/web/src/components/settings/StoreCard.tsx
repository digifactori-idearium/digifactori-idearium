import { SquarePen, Database } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { FormDialog } from '@/components/common/form/FormDialog';
import { CurrentStatus } from '@/components/settings/CurrentStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { storeInputs } from '@/lib/input';
import { updateStoreSettings } from '@/services/settings.service';

interface StoreCardProps {
  storage?: CloudStorage | null;
  onUpdated?: () => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ storage, onUpdated }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Partial<Settings>) => {
    try {
      setLoading(true);
      await updateStoreSettings(data);
      onUpdated?.();
      toast.success('Réussite de la configuration du stockage');
    } catch (error: any) {
      toast.error(error?.message || 'Échec de la configuration du stockage');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = !!storage?.provider;

  return (
    <Card className="overflow-hidden bg-sidebar border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Icon */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-white shadow-sm overflow-hidden">
              <Database className="w-10 h-10 text-mauve" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
              {storage?.name || 'Non défini'}
            </h3>

            <CurrentStatus status={isConfigured ? 'existing' : 'error'} />

            {/* Provider */}
            <p className="text-sm text-muted-foreground mt-2">
              {storage?.provider
                ? `Fournisseur : ${storage.provider}`
                : 'Aucun fournisseur configuré'}
            </p>

            {/* Endpoint / Public URL */}
            <p className="text-xs text-muted-foreground/60 mt-1 break-all">
              {storage?.publicUrl || storage?.endpoint || ''}
            </p>

            {/* Bucket */}
            {storage?.bucket && (
              <p className="text-xs text-muted-foreground/60 mt-1">
                Bucket : {storage.bucket}
              </p>
            )}
          </div>

          {/* Action */}
          <div className="w-full sm:w-auto ml-auto">
            <FormDialog
              trigger={
                <Button className="w-full sm:w-auto text-white! bg-mauve! hover:bg-mauve/80! border-mauve! uppercase text-xs font-bold px-6 py-5">
                  <SquarePen /> Mettre à jour le stockage
                </Button>
              }
              title="Modifier le stockage"
              description="Modifiez les informations du stockage..."
              inputs={storeInputs}
              initialValues={storage ?? undefined}
              onsubmit={handleSubmit}
              loading={loading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
