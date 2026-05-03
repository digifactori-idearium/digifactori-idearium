import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AssetDeleteDialog } from '../assets/AssetDeleteDialog';

import { FormDialog } from '@/components/common/form/FormDialog';
import { assetInputs } from '@/lib/input';
import { deleteAsset, updateAsset } from '@/services/asset.service';

interface AssetActionsProps {
  asset: Asset;
  refresh: () => void;
}

export const AssetActions = ({ asset, refresh }: AssetActionsProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: UpdateAssetInput) => {
    try {
      setLoading(true);
      await updateAsset(asset.id, data);
      toast.success('Asset mis à jour');
      refresh();
    } catch (error: any) {
      toast.error(error?.message ?? 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAsset(asset.id);
      toast.success('Asset supprimé');
      refresh();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <FormDialog
        trigger={
          <button
            className="p-2 rounded-full hover:bg-mauve/30 bg-mauve/10 text-mauve transition-colors"
            title="Modifier"
          >
            <Pencil className="h-4 w-4" />
          </button>
        }
        title="Modifier l'asset"
        description="Modifier les informations de l'asset"
        inputs={assetInputs}
        initialValues={{
          name: asset.name,
          category: asset.category,
          type: asset.type,
          tags: asset.tags,
        }}
        loading={loading}
        onsubmit={handleSubmit}
      />

      <AssetDeleteDialog
        trigger={
          <button
            className="p-2 rounded-full hover:bg-red-500/30 bg-red-500/10 text-red-500 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        }
        name={asset.name}
        onConfirm={handleDelete}
        onCancel={() => {}}
      />
    </div>
  );
};
