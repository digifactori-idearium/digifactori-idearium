import { SquarePlus } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '../global/data-table/dataTable';

import { columns } from './assetsColumns';

import { Form } from '@/components/global';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { assetInputs } from '@/lib/input';

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
  const [loading, setLoading] = useState(false);

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
                Ajouter un asset <SquarePlus />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-sidebar ">
              <DialogHeader>
                <DialogTitle>Ajouter un asset</DialogTitle>
                <DialogDescription>
                  Complétez les informations du nouvel asset et cliquer sur
                  envoyer pour le sauvegarder.
                </DialogDescription>
              </DialogHeader>
              <Form
                inputs={assetInputs}
                handleOnSubmit={() => {}}
                loading={loading}
              />
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
