import { Box, Music, SquarePen, Trash2, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import AlertDialog from '../dialog/AlertDialog';

import { FormDialog } from '@/components/common/form/FormDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { integrationInputs } from '@/lib/input';
import {
  deleteIntegration,
  updateIntegration,
} from '@/services/settings.service';

const TYPE_CONFIG: Record<
  IntegrationType,
  {
    label: string;
    iconBg: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
    Icon: LucideIcon;
    iconClass: string;
  }
> = {
  MODEL_3D: {
    label: 'Modèle 3D',
    accent: 'bg-[#1D9E75]',
    Icon: Box,
    iconClass: 'text-[#9FE1CB]',
    iconBg: 'bg-[#085041]',
    badgeBg: 'bg-[#085041]',
    badgeText: 'text-[#9FE1CB]',
  },
  SOUND: {
    label: 'Son',
    accent: 'bg-[#7F77DD]',
    Icon: Music,
    iconClass: 'text-[#CECBF6]',
    iconBg: 'bg-[#26215C]',
    badgeBg: 'bg-[#26215C]',
    badgeText: 'text-[#CECBF6]',
  },
  IMAGE: {
    label: 'Image',
    accent: 'bg-[#E07B39]',
    Icon: Box,
    iconClass: 'text-[#F5C4A0]',
    iconBg: 'bg-[#5C2E0E]',
    badgeBg: 'bg-[#5C2E0E]',
    badgeText: 'text-[#F5C4A0]',
  },
  OTHER: {
    label: 'Autre',
    accent: 'bg-[#888780]',
    Icon: Zap,
    iconClass: 'text-[#D3D1C7]',
    iconBg: 'bg-[#444441]',
    badgeBg: 'bg-[#444441]',
    badgeText: 'text-[#D3D1C7]',
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
  const [loading, setLoading] = useState(false);

  const config =
    TYPE_CONFIG[integration.type as IntegrationType] ?? TYPE_CONFIG.OTHER;

  const { Icon, iconClass } = config;

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
    <Card className="bg-sidebar border-border p-0 flex flex-col overflow-hidden transition-transform duration-300 hover:scale-[1.01]">
      {/* Accent bar */}
      <div className={`h-1 w-full ${config.accent}`} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header: icon + badge */}
        <div className="flex items-start justify-between">
          <div
            className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${config.iconBg}`}
          >
            <Icon size={18} strokeWidth={1.8} className={iconClass} />
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

        <div className="border-t border-border" />

        {/* Status */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              integration.isActive ? 'bg-[#1D9E75]' : 'bg-[#888780]'
            }`}
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
                className="flex-1 h-9 gap-2 text-xs font-medium"
              >
                <SquarePen size={13} />
                Edit
              </Button>
            }
            title="Modifier l'intégration"
            description="Modifiez les informations de l'intégration et cliquer sur envoyer pour le sauvegarder."
            inputs={integrationInputs}
            onsubmit={handleSubmit}
            loading={loading}
            initialValues={integration}
          />

          <AlertDialog
            trigger={
              <Button
                variant="outline"
                title="Supprimer"
                className="w-9 h-9 p-0 shrink-0 border-red-200 dark:border-red-900/40 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 bg-transparent"
              >
                <Trash2 size={13} />
              </Button>
            }
            description="Cela supprimera l'intégration."
            confirmationMessage="Oui, Supprimer"
            onConfirm={handleDelete}
            onCancel={() => {}}
          />
        </div>
      </div>
    </Card>
  );
};
