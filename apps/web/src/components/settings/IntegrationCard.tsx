import { Trash2, SquarePen, Music, Zap, Box } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import DeleteIntegrationDialog from './DeleteIntegrationDialog';

import { FormDialog } from '@/components/common/form/FormDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { integrationInputs } from '@/lib/input';
import {
  updateIntegration,
  deleteIntegration,
} from '@/services/settings.service';

const TYPE_CONFIG: Record<
  IntegrationType,
  {
    label: string;
    icon: React.ReactNode;
    accent: string;
    iconBg: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  MODEL_3D: {
    label: 'Modèle 3D',
    icon: <Box size={18} strokeWidth={1.8} className="text-white" />,
    accent: 'bg-[#1D9E75]',
    iconBg: 'bg-[#E1F5EE] dark:bg-[#085041]',
    badgeBg: 'bg-[#E1F5EE] dark:bg-[#085041]',
    badgeText: 'text-[#0F6E56] dark:text-[#9FE1CB]',
  },
  SOUND: {
    label: 'Son',
    icon: <Music size={18} strokeWidth={1.8} className="text-white" />,
    accent: 'bg-[#7F77DD]',
    iconBg: 'bg-[#EEEDFE] dark:bg-[#26215C]',
    badgeBg: 'bg-[#EEEDFE] dark:bg-[#26215C]',
    badgeText: 'text-[#3C3489] dark:text-[#CECBF6]',
  },
  IMAGE: {
    label: 'Image',
    icon: <Box size={18} strokeWidth={1.8} className="text-white" />,
    accent: 'bg-[#E07B39]',
    iconBg: 'bg-[#FEF0E7] dark:bg-[#5C2E0E]',
    badgeBg: 'bg-[#FEF0E7] dark:bg-[#5C2E0E]',
    badgeText: 'text-[#9C4A1A] dark:text-[#F5C4A0]',
  },
  OTHER: {
    label: 'Autre',
    icon: <Zap size={18} strokeWidth={1.8} className="text-white" />,
    accent: 'bg-[#888780]',
    iconBg: 'bg-[#F1EFE8] dark:bg-[#444441]',
    badgeBg: 'bg-[#F1EFE8] dark:bg-[#444441]',
    badgeText: 'text-[#5F5E5A] dark:text-[#D3D1C7]',
  },
};

interface Props {
  integration: Integration;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export const IntegrationCard: React.FC<Props> = ({
  integration,
  onUpdated,
  onDeleted,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const config =
    TYPE_CONFIG[integration.type as IntegrationType] ?? TYPE_CONFIG.OTHER;

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await updateIntegration(integration.id, data);
      toast.success('Intégration mise à jour avec succès');
      onUpdated?.();
    } catch (error: any) {
      toast.error(error?.message || "Échec de la mise à jour de l'intégration");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteIntegration(integration.id);
      setDeleteDialogOpen(false);
      toast.success('Intégration supprimée avec succès');
      onDeleted?.();
    } catch (error: any) {
      toast.error(error?.message || "Échec de suppression de l'intégration");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-sidebar border-white/10 p-0 flex flex-col overflow-hidden relative transition-transform duration-300 hover:scale-[1.01]">
      {/* Type accent bar */}
      <div className={`h-0.75 w-full ${config.accent}`} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div
            className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${config.iconBg}`}
          >
            {config.icon}
          </div>
          <span
            className={`text-[11px] font-medium tracking-wide px-2 py-1 rounded ${config.badgeBg} ${config.badgeText}`}
          >
            {config.label}
          </span>
        </div>

        {/* Name + URL */}
        <div>
          <p className="font-medium text-[15px] text-foreground leading-snug">
            {integration.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-50">
            {integration.url}
          </p>
        </div>

        <div className="border-t border-white/10" />

        {/* Status */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${integration.isActive ? 'bg-[#1D9E75]' : 'bg-[#888780]'}`}
          />
          <span className="text-xs text-muted-foreground">
            {integration.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <FormDialog
            trigger={
              <Button
                variant="outline"
                className="flex-1 h-9 gap-2 text-xs font-medium border-white/10 bg-transparent text-foreground hover:bg-white/5"
              >
                <SquarePen size={13} /> Edit
              </Button>
            }
            title="Modifier l'intégration"
            description="Modifiez les informations de l'intégration et cliquer sur envoyer pour le sauvegarder."
            inputs={integrationInputs}
            onsubmit={handleSubmit}
            loading={loading}
            initialValues={integration}
          />
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-9 h-9 p-0 border-red-900/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      <DeleteIntegrationDialog
        open={deleteDialogOpen}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Card>
  );
};
