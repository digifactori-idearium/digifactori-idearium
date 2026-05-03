import { FileInput, Loader2 } from 'lucide-react';
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

const MAX_SIZE_MB = 100;

const ACCEPTED_TYPES = {
  'model/gltf-binary': ['.glb'],
  'model/gltf+json': ['.gltf'],
  'application/json': ['.json'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  'audio/flac': ['.flac'],
  'audio/aac': ['.aac'],
  'audio/webm': ['.weba'],
  'audio/x-aiff': ['.aiff', '.aif'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

interface AssetFilesUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  loading?: boolean;
}

export function AssetFilesUpload({
  onUpload,
  loading = false,
}: AssetFilesUploadProps) {
  const [files, setFiles] = React.useState<File[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles =>
      setFiles(prev => {
        const deduped = acceptedFiles.filter(
          f => !prev.some(p => p.name === f.name && p.size === f.size)
        );
        return [...prev, ...deduped];
      }),
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    disabled: loading,
    noClick: true, // prevent dropzone from opening dialog on click; label handles it
  });

  const onRename = (oldName: string, newName: string) => {
    setFiles(prev =>
      prev.map(f =>
        f.name !== oldName ? f : new File([f], newName, { type: f.type })
      )
    );
  };

  const handleUpload = async () => {
    if (files.length === 0 || loading) return;
    await onUpload(files);
    setFiles([]);
  };

  return (
    <div className="w-full flex flex-col max-h-[80vh]">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle>Ajoutez de nouveaux assets</CardTitle>
        <CardDescription>
          Améliorez votre expérience en ajoutant vos propres fichiers.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden pb-0">
        <div className="flex flex-col flex-1 min-h-0 gap-4">
          {/* Drop zone — fixed, never grows */}
          <div>
            <Label htmlFor="file-upload" className="font-medium">
              Téléchargement de fichier(s)
            </Label>
            <div
              {...getRootProps()}
              className={cn(
                'cursor-pointer mt-2 flex justify-center rounded-md border border-dashed px-6 py-10 transition-colors duration-200',
                isDragActive
                  ? 'border-mauve bg-mauve/10 ring-2 ring-mauve/20'
                  : 'border-border',
                loading && 'pointer-events-none opacity-50'
              )}
            >
              <div className="text-center">
                <FileInput
                  className="mx-auto h-10 w-10 text-mauve"
                  aria-hidden
                />
                <div className="mt-3 flex flex-wrap justify-center gap-x-1 text-sm text-muted-foreground">
                  <p>Glisser et déposer ou</p>
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-sm font-medium text-mauve hover:text-mauve/80 hover:underline hover:underline-offset-4"
                  >
                    <span>choisissez un/des fichier(s)</span>
                    <input
                      {...getInputProps()}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                    />
                  </label>
                  <p>à télécharger</p>
                </div>
              </div>
            </div>

            <p className="mt-2 text-xs text-muted-foreground space-y-0.5">
              <span className="block">
                <b>Types acceptés :</b>{' '}
                {Object.values(ACCEPTED_TYPES).flat().join(', ')}
              </span>
              <span className="block">
                <b>Taille max :</b> {MAX_SIZE_MB} MB par fichier
              </span>
            </p>
          </div>

          {files.length > 0 && (
            <div className="flex flex-col min-h-0 flex-1">
              <h4 className="shrink-0 font-medium text-foreground mb-2">
                Fichier(s) à télécharger{' '}
                <span className="text-muted-foreground font-normal text-sm">
                  ({files.length})
                </span>
              </h4>
              <ul
                role="list"
                className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0"
              >
                {files.map(file => (
                  <FileItem
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    file={file}
                    files={files}
                    onRemove={() =>
                      setFiles(prev => prev.filter(f => f.name !== file.name))
                    }
                    onRename={onRename}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center justify-between pt-4 pb-4 border-t mt-4">
          <span className="text-sm text-muted-foreground">
            {files.length > 0
              ? `${files.length} fichier(s) prêt(s)`
              : 'Aucun fichier sélectionné'}
          </span>
          <Button
            className="text-white! bg-mauve! hover:bg-mauve/80! border-mauve!"
            type="button"
            disabled={files.length === 0 || loading}
            onClick={handleUpload}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Téléchargement…
              </>
            ) : (
              'Télécharger'
            )}
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
