import WavesurferPlayer from '@wavesurfer/react';
import { useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { AssetThumbnail } from '@/components/assets/AssetThumbnail';

export function AssetPreview({ name, url }: { name: string; url: string }) {
  const is3D = name.endsWith('.glb') || name.endsWith('.gltf');
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
