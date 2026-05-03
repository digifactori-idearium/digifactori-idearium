import WavesurferPlayer from '@wavesurfer/react';
import { FileQuestion } from 'lucide-react';
import { useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { AssetThumbnail } from '@/components/assets/AssetThumbnail';
import { is3DModel, isImage, isSound } from '@/lib/asset';

export function AssetUplaodPreview({
  name,
  url,
  file,
}: Readonly<{
  name: string;
  url: string;
  file?: File;
}>) {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);

  const mockFile = file ?? new File([], name);
  const _is3D = is3DModel(mockFile);
  const _isImage = isImage(mockFile);
  const _isSound = isSound(mockFile);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  if (_is3D) {
    return (
      <PreviewShell>
        <AssetThumbnail file={url} />
      </PreviewShell>
    );
  }

  if (_isImage) {
    return (
      <PreviewShell>
        <img src={url} alt={name} className="h-full w-full object-contain" />
      </PreviewShell>
    );
  }

  if (_isSound) {
    return (
      <PreviewShell>
        <button
          type="button"
          aria-label="Lecture / Pause"
          onClick={() => wavesurfer?.playPause()}
          onKeyDown={e => e.key === 'Enter' && wavesurfer?.playPause()}
          className="cursor-pointer w-full h-full flex items-center justify-center bg-transparent border-0 p-0"
        >
          <WavesurferPlayer
            height={100}
            width={128}
            waveColor="#f3bee1"
            progressColor="#6f51b0"
            url={url}
            interact={false}
            onReady={ws => setWavesurfer(ws)}
          />
        </button>
      </PreviewShell>
    );
  }

  // Unknown / unsupported format, show extension badge instead of crashing.
  const ext = name.split('.').pop()?.toUpperCase() ?? '?';
  return (
    <PreviewShell>
      <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
        <FileQuestion className="h-8 w-8" />
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {ext}
        </span>
      </div>
    </PreviewShell>
  );
}

function PreviewShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <span className="shrink-0 flex h-32 w-32 items-center justify-center rounded-md bg-sidebar overflow-hidden">
      {children}
    </span>
  );
}
