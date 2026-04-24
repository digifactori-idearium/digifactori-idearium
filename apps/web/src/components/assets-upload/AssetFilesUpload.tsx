import { File } from 'lucide-react';
import React from 'react';
import { useDropzone } from 'react-dropzone';

import { FileItem } from './FileItem';

import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function AssetFilesUpload() {
  const MAX_SIZE = 25;
  const [files, setFiles] = React.useState<File[]>([]);
  const ACCEPTED_TYPES = {
    'model/gltf-binary': ['.glb'],
    'model/gltf+json': ['.gltf'],
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'audio/ogg': ['.ogg'],
    'audio/flac': ['.flac'],
    'audio/aac': ['.aac'],
    'audio/webm': ['.weba'],
    'audio/x-aiff': ['.aiff', '.aif'],
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => setFiles(acceptedFiles),
    accept: ACCEPTED_TYPES,
  });

  const filesList = files.map(file => (
    <FileItem
      key={file.name}
      file={file}
      onRemove={() =>
        setFiles(prevFiles =>
          prevFiles.filter(prevFile => prevFile.name !== file.name)
        )
      }
    ></FileItem>
  ));

  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle>Ajoutez de nouveaux assets</CardTitle>
        <CardDescription>
          Améliorez votre expérience en ajoutant vos propres fichiers d'assets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action="#" method="post">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <div className="col-span-full">
              <Label htmlFor="file-upload-2" className="font-medium mt-4">
                Téléchargement de fichier(s)
              </Label>
              <div
                {...getRootProps()}
                className={cn(
                  isDragActive
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                    : 'border-border',
                  'cursor-pointer mt-2 flex justify-center rounded-md border border-dashed px-6 py-20 transition-colors duration-200'
                )}
              >
                <div>
                  <File
                    className="mx-auto h-12 w-12 text-mauve"
                    aria-hidden={true}
                  />
                  <div className="mt-4 flex text-muted-foreground">
                    <p>Glisser et déposer ou</p>
                    <label
                      htmlFor="file"
                      className="relative cursor-pointer rounded-sm pl-1 font-medium text-mauve hover:text-mauve/80 hover:underline hover:underline-offset-4"
                    >
                      <span>choisissez un/des fichier(s)</span>
                      <input
                        {...getInputProps()}
                        id="file-upload-2"
                        name="file-upload-2"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="text-pretty pl-1">à télécharger</p>
                  </div>
                </div>
              </div>
              <p className="text-pretty mt-2 text-sm leading-5 text-muted-foreground flex flex-col gap-1">
                <span>
                  <b>Types de fichiers acceptés :</b>
                  {Object.values(ACCEPTED_TYPES).flat().join(', ')}
                </span>
                <span>
                  <b>Taille maximale par fichier</b>: {MAX_SIZE}MB
                </span>
              </p>
              {filesList.length > 0 && (
                <>
                  <h4 className="text-balance mt-6 font-medium text-foreground">
                    Fichier(s) à télécharger
                  </h4>
                  <ul
                    role="list"
                    className="mt-2 space-y-4 max-h-48 overflow-y-auto pr-1"
                  >
                    {filesList}
                  </ul>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3">
            <Button
              className="mt-6 ml-auto text-white! bg-mauve! hover:bg-mauve/80! !border-mauve"
              type="submit"
            >
              Télécharger
            </Button>
          </div>
        </form>
      </CardContent>
    </div>
  );
}
