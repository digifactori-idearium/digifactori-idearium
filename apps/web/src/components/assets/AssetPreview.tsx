import WavesurferPlayer from '@wavesurfer/react';
import { AlertTriangle } from 'lucide-react';
import React, { useState, memo } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { AssetThumbnail } from '@/components/assets/AssetThumbnail';
import { useStorageUrl } from '@/hooks/useStorageFile';

interface AssetPreviewProps {
  fileKey: string;
}

const SOUND_EXTENSIONS = new Set([
  'mp3',
  'wav',
  'ogg',
  'flac',
  'aac',
  'weba',
  'aiff',
  'aif',
  'm4a',
  'opus',
]);

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

const MODEL_3D_EXTENSIONS = new Set(['glb', 'gltf']);

function getExt(fileKey: string): string {
  return fileKey.split('.').pop()?.toLowerCase() ?? '';
}

type ExtensionType = '3d' | 'sound' | 'image' | 'unknown';

/**
 * Decide what the type of the assets base on his category and extension..
 */
function resolveExtensionType(fileKey: string): ExtensionType {
  const ext = getExt(fileKey);
  if (MODEL_3D_EXTENSIONS.has(ext)) return '3d';
  if (SOUND_EXTENSIONS.has(ext)) return 'sound';
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  return 'unknown';
}

const PreviewContainer = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => (
  <span className="shrink-0 flex h-20 w-20 items-center justify-center rounded-md bg-sidebar overflow-hidden border border-border/50">
    {children}
  </span>
);

export const AssetPreview = memo(
  ({ fileKey }: AssetPreviewProps) => {
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const { url, loading, error } = useStorageUrl(fileKey);

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
          <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <AlertTriangle className="h-7 w-7 text-muted-foreground/50" />
            <span className="text-[10px] uppercase tracking-wide">
              {error ? 'Error' : 'Empty'}
            </span>
          </div>
        </PreviewContainer>
      );

    const kind = resolveExtensionType(fileKey);

    if (kind === '3d') {
      return (
        <PreviewContainer>
          <AssetThumbnail file={url} />
        </PreviewContainer>
      );
    }

    if (kind === 'sound') {
      return (
        <PreviewContainer>
          <button
            type="button"
            aria-label="Lecture / Pause"
            onClick={e => {
              e.stopPropagation();
              wavesurfer?.playPause();
            }}
            onKeyDown={e => e.key === 'Enter' && wavesurfer?.playPause()}
            className="cursor-pointer w-full h-full flex items-center justify-center bg-transparent border-0 p-0"
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
          </button>
        </PreviewContainer>
      );
    }

    if (kind === 'image') {
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

    // Unknown / unsupported
    return (
      <PreviewContainer>
        <div className="text-xs font-bold text-muted-foreground text-center px-1 break-all uppercase">
          {getExt(fileKey) || '?'}
        </div>
      </PreviewContainer>
    );
  },
  (prev, next) => prev.fileKey === next.fileKey
);

AssetPreview.displayName = 'AssetPreview';
