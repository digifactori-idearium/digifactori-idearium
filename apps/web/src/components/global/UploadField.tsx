import { CloudUpload, Trash, TriangleAlert } from 'lucide-react';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UseFormSetValue } from 'react-hook-form';

interface UploadFieldProps {
  name: string;
  setValue: UseFormSetValue<any>;
  placeholder?: string;
  error?: string;
  type?: string;
}

const UploadField: React.FC<UploadFieldProps> = ({
  name,
  setValue,
  placeholder,
  error,
  type,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setValue(name, file);
    setFileName(file.name);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept:
      type === 'image'
        ? { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp'] }
        : {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
              ['.docx'],
          },
    maxFiles: 1,
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue(name, null);
    setFileName(null);
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex items-center p-4 border border-dashed ${error ? 'border-red-500' : 'border-gray-300'} rounded-md cursor-pointer hover:bg-sidebar/90!`}
      >
        <input {...getInputProps()} />
        {!fileName ? (
          <>
            <CloudUpload className="h-6 w-6 text-gray-500 mr-2" />
            <p className="text-gray-500">{placeholder}</p>
          </>
        ) : (
          <div className="flex justify-between w-full">
            <p className="text-gray-700">{fileName}</p>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-gray-500 hover:text-gray-700 relative z-10"
            >
              <Trash className="text-red-600 h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {error && (
        <span className="text-red-600">
          <TriangleAlert className="mr-2" /> {error}
        </span>
      )}
    </div>
  );
};

export default UploadField;
