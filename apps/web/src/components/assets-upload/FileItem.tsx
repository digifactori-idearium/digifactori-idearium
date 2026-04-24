import WavesurferPlayer from '@wavesurfer/react';
import convertSize from 'convert-size';
import { File, Trash } from 'lucide-react';
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
  const [isPlaying, setIsPlaying] = useState(false);

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
    setIsPlaying(false);
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
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
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
          <span className="flex h-32 w-32 items-center justify-center rounded-md bg-sidebar overflow-hidden">
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
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              </>
            )}
          </span>
          <div>
            <p className="text-pretty font-medium text-foreground">
              {file.name}
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
