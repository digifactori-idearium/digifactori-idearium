import { SquarePlus } from 'lucide-react';

import { DataTable } from '../common/data-table/dataTable';

import { columns } from './assetsColumns';

import { AssetFilesUpload } from '@/components/assets-upload/AssetFilesUpload';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

function getData(): Asset[] {
  return [
    {
      name: 'pizza',
      category: 'nourriture',
      description: 'pizza kebab',
      preview:
        'https://media.sketchfab.com/models/638719eba7234613b869550dcdefa597/thumbnails/982febf106a0414da2d35995bd26c396/31775e4da53a46c3937ef6ee1fcbfd12.jpeg',
    },
    {
      name: 'burger',
      category: 'nourriture',
      description: 'burger sans sauce',
      preview:
        'https://preview.free3d.com/img/2010/10/1688650028991645249/a7b0bqps.jpg',
    },
    {
      name: 'voiture',
      category: 'vehicules',
      description: 'vieille voiture verte',
      preview: 'https://s3.envato.com/files/509493379/Cycles%201.png',
    },
  ];
}

export default function AssetHandling() {
  const data = getData();

  return (
    <div className="w-full min-h-screen p-6">
      <div className="magic-text text-center md:text-5xl text-3xl justify-center flex items-center gap-2 font-bold mb-6">
        Gérez les assets
      </div>

      <div className="container mx-auto py-10">
        <div className="w-full max-w-6xl mx-auto sm:px-6 lg:px-8">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="ml-auto text-white! bg-mauve! hover:bg-mauve/80! !border-mauve">
                Ajouter des assets <SquarePlus />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-sidebar !max-w-3xl w-full">
              <AssetFilesUpload />
            </DialogContent>
          </Dialog>
        </div>
        <DataTable
          columns={columns}
          data={data}
          filterColumn="name"
          filterColumnText="assets"
        />
      </div>
    </div>
  );
}
