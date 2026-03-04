// hooks/useModelIO.ts
import { useThree } from '@react-three/fiber';
import { useCallback } from 'react';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface UseModelIOOptions {
  fileName?: string;
}

export function useModel(options?: UseModelIOOptions) {
  const { scene } = useThree();
  const fileName = options?.fileName ?? 'scene';

  // -------------------------
  // DOWNLOAD
  // -------------------------
  const downloadModel = useCallback(
    (binary: boolean = false) => {
      const exporter = new GLTFExporter();

      exporter.parse(
        scene,
        (result: ArrayBuffer | object) => {
          const output =
            result instanceof ArrayBuffer
              ? result
              : JSON.stringify(result, null, 2);

          const blob = new Blob([output], {
            type: 'application/octet-stream',
          });

          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = binary ? `${fileName}.glb` : `${fileName}.gltf`;
          link.click();
        },
        { binary }
      );
    },
    [scene, fileName]
  );

  // -------------------------
  // UPLOAD
  // -------------------------
  const uploadModel = useCallback(
    (file: File) => {
      const loader = new GLTFLoader();
      const reader = new FileReader();

      reader.onload = e => {
        const contents = e.target?.result;
        if (!contents) return;

        if (file.name.endsWith('.glb')) {
          loader.parse(
            contents as ArrayBuffer,
            '',
            gltf => {
              scene.add(gltf.scene);
            },
            error => console.error('Error loading GLB:', error)
          );
        } else {
          loader.parse(
            contents as string,
            '',
            gltf => {
              scene.add(gltf.scene);
            },
            error => console.error('Error loading GLTF:', error)
          );
        }
      };

      if (file.name.endsWith('.glb')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    },
    [scene]
  );

  return {
    downloadModel,
    uploadModel,
  };
}
