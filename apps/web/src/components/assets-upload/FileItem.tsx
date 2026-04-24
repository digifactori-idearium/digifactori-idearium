import convertSize from 'convert-size';
import { File, Trash } from 'lucide-react';
import { useEffect, useMemo } from 'react';

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
          <span className="flex h-32 w-32 items-center justify-center rounded-md bg-muted overflow-hidden">
            {is3D ? (
              <AssetThumbnail file={objectUrl} />
            ) : (
              <File className="h-5 w-5 text-foreground" aria-hidden={true} />
            )}
          </span>
          <div>
            <p className="text-pretty font-medium text-foreground">
              {file.name}
            </p>
            <p className="text-pretty mt-0.5 text-sm text-muted-foreground">
              {Math.round(parseFloat(convertSize(file.size)))} MB
            </p>
          </div>
        </CardContent>
      </Card>
    </li>
  );
};
