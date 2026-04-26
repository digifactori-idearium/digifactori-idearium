import { SquarePlus } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '../common/data-table/dataTable';

import { columns } from './assetsColumns';

import { AssetFilesUpload } from '@/components/assets-upload/AssetFilesUpload';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function AssetHandling() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [open, setOpen] = useState(false);

  const onUpload = (files: File[]) => {
    const newAssets: Asset[] = files.map(file => ({
      name: file.name,
      category: '',
      description: '',
      type: file.type.startsWith('/audio')
        ? 'MUSIC'
        : ('ASSET' as IntegrationType),
      preview: URL.createObjectURL(file),
    }));
    setAssets(prev => [...prev, ...newAssets]);
    setOpen(false);
  };

  return (
    <div className="w-full min-h-screen p-6">
      <div className="magic-text text-center md:text-5xl text-3xl justify-center flex items-center gap-2 font-bold mb-6">
        Gérez les assets
      </div>

      <div className="container mx-auto py-10">
        <div className="w-full max-w-6xl mx-auto sm:px-6 lg:px-8">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="ml-auto text-white! bg-mauve! hover:bg-mauve/80! !border-mauve">
                Ajouter des assets <SquarePlus />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-sidebar !max-w-3xl w-full">
              <AssetFilesUpload onUpload={onUpload} />
            </DialogContent>
          </Dialog>
        </div>
        <DataTable
          columns={columns}
          data={assets}
          filterColumn="name"
          filterColumnText="assets"
        />
      </div>
    </div>
  );
}
