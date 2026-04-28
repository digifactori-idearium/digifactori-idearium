import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';

import { DataTable } from '../common/data-table/dataTable';

import { columns } from './assetsColumns';

import { AssetFilesUpload } from '@/components/assets-upload/AssetFilesUpload';
import { SuperButton } from '@/components/common/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function AssetHandling() {
  const [data, setData] = useState<Asset[]>([]);
  const [open, setOpen] = useState(false);

  const onUpload = (files: File[]) => {
    const newAssets: Asset[] = files.map(file => ({
      name: file.name,
      category: '',
      description: '',
      type: file.type.startsWith('audio/')
        ? 'MUSIC'
        : ('ASSET' as IntegrationType),
      preview: URL.createObjectURL(file),
    }));
    setData(prev => [...prev, ...newAssets]);
    setOpen(false);
  };

  const refresh = useCallback(() => {}, []);

  return (
    <div className="container mx-auto h-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="magic-text md:text-5xl text-3xl font-bold">
          Gérez les assets
        </h1>
      </div>

      <div className="fcontainer mx-auto">
        <div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <SuperButton
                voiceText={"Le paramètre avancé, c'est pour les grands."}
                className="flex items-center gap-2 form-button"
              >
                <Plus className="w-4 h-4" />
                Ajouter des assets
              </SuperButton>
            </DialogTrigger>
            <DialogContent className="bg-sidebar !max-w-3xl w-full">
              <AssetFilesUpload onUpload={onUpload} />
            </DialogContent>
          </Dialog>
        </div>
        <DataTable columns={columns(refresh)} data={data} />
      </div>
    </div>
  );
}
