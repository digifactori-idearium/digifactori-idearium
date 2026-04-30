import WavesurferPlayer from '@wavesurfer/react';
import React, { useState, memo } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { AssetThumbnail } from '@/components/assets/AssetThumbnail';
import { useStorageFile } from '@/hooks/useStorageFile';

interface AssetPreviewProps {
  fileKey: string;
  category?: string;
}

const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'avif',
  'bmp',
  'tiff',
  'tif',
]);

const is3DAsset = (fileKey: string): boolean => {
  const ext = fileKey.split('.').pop()?.toLowerCase();
  return ext === 'glb' || ext === 'gltf';
};

const isAudioAsset = (fileKey: string, category?: string): boolean => {
  if (category === 'MUSIC') return true;
  const ext = fileKey.split('.').pop()?.toLowerCase();
  return ['mp3', 'wav', 'ogg', 'flac', 'aac', 'weba', 'aiff'].includes(
    ext ?? ''
  );
};

const isImageAsset = (fileKey: string): boolean => {
  const ext = fileKey.split('.').pop()?.toLowerCase();
  return IMAGE_EXTENSIONS.has(ext ?? '');
};

const PreviewContainer = ({ children }: { children: React.ReactNode }) => (
  <span className="shrink-0 flex h-20 w-20 items-center justify-center rounded-md bg-sidebar overflow-hidden border border-border/50">
    {children}
  </span>
);

export const AssetPreview = memo(
  ({ fileKey, category }: AssetPreviewProps) => {
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const { url, loading, error } = useStorageFile(fileKey);

    if (loading)
      return (
        <PreviewContainer>
          <div className="animate-pulse text-[10px] text-muted-foreground uppercase">
            Loading
          </div>
        </PreviewContainer>
      );

    if (error || !url)
      return (
        <PreviewContainer>
          <div className="text-[10px] text-destructive uppercase">
            {error ? 'Error' : 'Empty'}
          </div>
        </PreviewContainer>
      );

    // 3D Assets
    if (is3DAsset(fileKey)) {
      return (
        <PreviewContainer>
          <AssetThumbnail file={url} />
        </PreviewContainer>
      );
    }

    // Audio Assets
    if (isAudioAsset(fileKey, category)) {
      return (
        <PreviewContainer>
          <div
            onClick={e => {
              e.stopPropagation();
              wavesurfer?.playPause();
            }}
            className="cursor-pointer w-full h-full flex items-center justify-center"
          >
            <WavesurferPlayer
              height={40}
              width={70}
              waveColor="#f3bee1"
              progressColor="#6f51b0"
              url={url}
              interact={false}
              onReady={ws => setWavesurfer(ws)}
            />
          </div>
        </PreviewContainer>
      );
    }

    // Image files — decided by extension
    if (isImageAsset(fileKey)) {
      return (
        <PreviewContainer>
          <img
            src={url}
            alt={fileKey.split('/').pop()}
            className="h-full w-full object-contain"
          />
        </PreviewContainer>
      );
    }

    // Fallback for other file types
    return (
      <PreviewContainer>
        <div className="text-xs font-bold text-muted-foreground text-center px-1 break-all uppercase">
          {fileKey.split('.').pop()}
        </div>
      </PreviewContainer>
    );
  },
  (prev, next) => {
    return prev.fileKey === next.fileKey && prev.category === next.category;
  }
);

AssetPreview.displayName = 'AssetPreview';
