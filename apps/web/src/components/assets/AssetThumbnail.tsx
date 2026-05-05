import { useEffect, useState } from 'react';

import { thumbnailManager } from '@/lib/thumbnail-manager';

export function AssetThumbnail({ file }: { file: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      try {
        const url = await thumbnailManager.generateThumbnail(file);
        if (!cancelled) {
          setImgUrl(url);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    generate();

    return () => {
      cancelled = true;
    };
  }, [file]);

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt="Thumbnail"
        className="w-full h-full object-contain"
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      {loading && (
        <div className="animate-pulse text-[10px] text-white/40">
          LOADING...
        </div>
      )}
    </div>
  );
}
