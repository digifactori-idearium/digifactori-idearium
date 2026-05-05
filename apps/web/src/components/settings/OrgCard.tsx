import { SquarePen, EarthLock, UserLock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { FormDialog } from '@/components/common/form/FormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { orgInputs } from '@/lib/input';
import { updateOrgSettings } from '@/services/settings.service';

interface StoreCardProps {
  setting: Settings | null;
  onUpdated?: () => void;
}

export const OrgCard: React.FC<StoreCardProps> = ({ setting, onUpdated }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Partial<Settings>) => {
    try {
      setLoading(true);
      await updateOrgSettings(data);
      onUpdated?.();
      toast.success("Reussite de la configuration de l'organisation");
    } catch (error: any) {
      toast.error(
        error?.message || "Échec de la configuration de l'organisation"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden bg-sidebar border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6">
          <div className="flex flex-col gap-3">
            <div className="relative shrink-0  flex gap-2 flex-wrap items-center">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white shadow-sm overflow-hidden">
                <EarthLock className="w-7 h-7 text-mauve" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {'Oragnisation Code: '.concat(
                  setting?.orgCode ? '******' : 'Non défini'
                )}
              </h3>
            </div>

            <div className="relative shrink-0 flex gap-2 flex-wrap items-center">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white shadow-sm overflow-hidden">
                <UserLock className="w-7 h-7 text-mauve" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {'Code Parental: '.concat(
                  setting?.orgParentalCode ? '****' : 'Non défini'
                )}
              </h3>
            </div>
          </div>

          <div className="w-full md:w-auto ml-auto">
            <FormDialog
              trigger={
                <Button className="w-full md:w-auto text-white! bg-mauve! hover:bg-mauve/80! border-mauve! uppercase text-xs font-bold px-6 py-5">
                  <SquarePen /> Modifier
                </Button>
              }
              title="Modifier le store"
              description="Modifiez les informations du store..."
              inputs={orgInputs}
              initialValues={setting ?? undefined}
              onsubmit={handleSubmit}
              loading={loading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
