import { FileInput } from 'lucide-react';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { UseFormSetValue } from 'react-hook-form';

import { FileItem } from '@/components/assets-upload/FileItem';
import { FieldError } from '@/components/ui/field';
import { cn } from '@/lib/utils';

const MAX_SIZE_MB = 100;

const ACCEPTED_TYPES = {
  'model/gltf-binary': ['.glb'],
  'model/gltf+json': ['.gltf'],
  'application/json': ['.json'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  'audio/flac': ['.flac'],
  'audio/aac': ['.aac'],
  'audio/webm': ['.weba'],
  'audio/x-aiff': ['.aiff', '.aif'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

interface AssetUploadFieldProps {
  name: string;
  setValue: UseFormSetValue<any>;
  error?: string;
  placeholder?: string;
  multiple?: boolean;
}

export const AssetUploadField: React.FC<AssetUploadFieldProps> = ({
  name,
  setValue,
  error,
  placeholder = 'Glissez vos fichiers ici ou cliquez pour parcourir',
  multiple = true,
}) => {
  const [files, setFiles] = React.useState<File[]>([]);

  const updateValue = (updated: File[]) => {
    setFiles(updated);
    if (!multiple) {
      setValue(name, updated[0] ?? null);
    } else {
      setValue(name, updated.length > 0 ? updated : null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      if (!multiple) {
        updateValue(acceptedFiles.slice(0, 1));
        return;
      }
      const deduped = acceptedFiles.filter(
        f => !files.some(p => p.name === f.name && p.size === f.size)
      );
      updateValue([...files, ...deduped]);
    },
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    maxFiles: multiple ? undefined : 1,
  });

  const onRemove = (fileName: string) =>
    updateValue(files.filter(f => f.name !== fileName));

  const onRename = (oldName: string, newName: string) =>
    updateValue(
      files.map(f =>
        f.name !== oldName ? f : new File([f], newName, { type: f.type })
      )
    );

  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer flex justify-center rounded-md border border-dashed px-6 py-8 transition-colors duration-200',
          isDragActive
            ? 'border-mauve bg-mauve/10 ring-2 ring-mauve/20'
            : error
              ? 'border-destructive'
              : 'border-border'
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <FileInput
            className="mx-auto h-8 w-8 text-muted-foreground"
            aria-hidden
          />
          <p className="mt-2 text-sm text-muted-foreground">{placeholder}</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            GLB, GLTF, MP3, WAV, PNG, JPG, WEBP… — max {MAX_SIZE_MB} MB
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map(file => (
            <FileItem
              key={file.name}
              file={file}
              files={files}
              onRemove={() => onRemove(file.name)}
              onRename={onRename}
            />
          ))}
        </ul>
      )}

      {error && <FieldError errors={[{ message: error }]} />}
    </div>
  );
};
