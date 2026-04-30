import WavesurferPlayer from '@wavesurfer/react';
import { useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { AssetThumbnail } from '@/components/assets/AssetThumbnail';

export function AssetUplaodPreview({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  const is3D = name.endsWith('.glb') || name.endsWith('.gltf');
  const isImage =
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.gif') ||
    name.endsWith('.webp') ||
    name.endsWith('.svg') ||
    name.endsWith('.avif') ||
    name.endsWith('.bmp') ||
    name.endsWith('.tiff') ||
    name.endsWith('.tif');
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
  };

  const onPlayPause = () => {
    if (wavesurfer) wavesurfer.playPause();
  };

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <span className="shrink-0 flex h-32 w-32 items-center justify-center rounded-md bg-sidebar overflow-hidden">
      {is3D ? (
        <AssetThumbnail file={url} />
      ) : isImage ? (
        <img src={url} alt={name} className="h-full w-full object-contain" />
      ) : (
        <div onClick={onPlayPause} className="cursor-pointer">
          <WavesurferPlayer
            height={100}
            width={128}
            waveColor="#f3bee1"
            progressColor="#6f51b0"
            url={url}
            interact={false}
            onReady={onReady}
          />
        </div>
      )}
    </span>
  );
}
