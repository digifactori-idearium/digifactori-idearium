import WavesurferPlayer from '@wavesurfer/react';
import convertSize from 'convert-size';
import { RotateCcw, Trash } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import WaveSurfer from 'wavesurfer.js';

import { AssetThumbnail } from '@/components/assets/AssetThumbnail';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const FileItem = ({
  file,
  files,
  onRemove,
  onRename,
}: {
  file: File;
  files: File[];
  onRemove: () => void;
  onRename: (oldName: string, newName: string) => void;
}) => {
  const is3D = file.name.endsWith('.glb') || file.name.endsWith('.gltf');
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);

  const nameSplit = file.name.split('.');
  const ext = nameSplit.length > 1 ? nameSplit.pop() : '';
  // Name without the extension
  const baseName = nameSplit.join('.');

  const [fileName, setFileName] = useState<string>(baseName);
  const [originalName] = useState<string>(baseName);

  function undoRename() {
    setFileName(originalName);
  }

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
  };

  const onPlayPause = () => {
    if (wavesurfer) wavesurfer.playPause();
  };

  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return (
    <li className="relative">
      <Card className="bg-sidebar relative p-4 shadow-none">
        <div className="flex gap-3 absolute right-4 top-1/2 -translate-y-1/2 z-10">
          {fileName !== originalName && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Rename file"
              onClick={undoRename}
            >
              <RotateCcw className="h-5 w-5" aria-hidden={true} />
            </Button>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label="Remove file"
            onClick={onRemove}
          >
            <Trash className="h-5 w-5" aria-hidden={true} />
          </Button>
        </div>
        <CardContent className="flex items-center space-x-3 p-0">
          <span className="shrink-0 flex h-32 w-32 items-center justify-center rounded-md bg-sidebar overflow-hidden">
            {is3D ? (
              <AssetThumbnail file={objectUrl} />
            ) : (
              <div onClick={onPlayPause} className="cursor-pointer">
                <WavesurferPlayer
                  height={100}
                  width={128}
                  waveColor="#f3bee1"
                  progressColor="#6f51b0"
                  url={objectUrl}
                  interact={false}
                  onReady={onReady}
                />
              </div>
            )}
          </span>
          <div className="min-w-0 pr-24">
            <p
              className="rounded-sm border-2 border-transparent focus:border-mauve focus:outline-none transition-colors text-foreground hover:text-foreground/70 cursor-text text-pretty font-medium break-words"
              contentEditable
              suppressContentEditableWarning
              onBlur={e => {
                const newName = e.currentTarget.textContent?.trim();
                if (!newName) {
                  e.currentTarget.textContent = fileName;
                } else {
                  const fullNewName = newName + '.' + ext;
                  const nameExists = files.some(
                    // Check if the name already exists (with the same extension)
                    // Ignore the current file when renaming with the same name
                    f => f.name === fullNewName && f.name !== file.name
                  );
                  if (nameExists) {
                    e.currentTarget.textContent = fileName;
                    toast.error(
                      'Un fichier de même type existe déjà avec ce nom.'
                    );
                  } else {
                    setFileName(newName);
                    onRename(file.name, newName + '.' + ext);
                  }
                }
              }}
              onKeyDown={e => {
                if (e.key == 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            >
              {fileName}
            </p>
            <p className="text-pretty mt-0.5 text-sm text-muted-foreground">
              <b>Taille</b>: {Math.round(parseFloat(convertSize(file.size)))}
              {convertSize(file.size).split(' ')[1]}
            </p>
            <p className="text-pretty mt-0.5 text-sm text-muted-foreground">
              <b>Type</b>: {ext}
            </p>
          </div>
        </CardContent>
      </Card>
    </li>
  );
};
