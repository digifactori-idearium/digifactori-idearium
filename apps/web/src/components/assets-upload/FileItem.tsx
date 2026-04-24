import WavesurferPlayer from '@wavesurfer/react';
import convertSize from 'convert-size';
import { RotateCcw, Trash } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { AssetThumbnail } from '@/components/assets/AssetThumbnail';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const FileItem = ({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) => {
  const is3D = file.name.endsWith('.glb') || file.name.endsWith('.gltf');
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [fileName, setFileName] = useState<string>(file.name);
  const [originalName] = useState<string>(file.name);

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
  };

  const onPlayPause = () => {
    if (wavesurfer) wavesurfer.playPause();
  };

  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  function undoRename() {
    setFileName(originalName);
  }

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
              <>
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
              </>
            )}
          </span>
          <div className="min-w-0 pr-24">
            <p
              className="text-foreground hover:text-foreground/70 cursor-text text-pretty font-medium break-words"
              contentEditable
              suppressContentEditableWarning
              onBlur={e => {
                const newName = e.currentTarget.textContent?.trim();
                if (newName) {
                  setFileName(newName);
                } else {
                  e.currentTarget.textContent = fileName;
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
              {Math.round(parseFloat(convertSize(file.size)))}{' '}
              {convertSize(file.size).split(' ')[1]}
            </p>
          </div>
        </CardContent>
      </Card>
    </li>
  );
};
