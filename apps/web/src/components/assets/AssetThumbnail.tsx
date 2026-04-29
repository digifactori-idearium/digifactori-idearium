import { useGLTF } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useState, Suspense, useEffect } from 'react';
import * as THREE from 'three';

function SceneToImage({
  file,
  onGenerated,
}: {
  file: string;
  onGenerated: (url: string) => void;
}) {
  const { gl, scene, camera } = useThree();
  const { scene: model } = useGLTF(file);

  useEffect(() => {
    const container = new THREE.Group();
    const clone = model.clone();

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;

    clone.scale.setScalar(scale);
    clone.position.sub(center.multiplyScalar(scale));

    container.add(clone);
    scene.add(container);

    const timeout = setTimeout(() => {
      gl.render(scene, camera);
      gl.domElement.toBlob(
        blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            onGenerated(url);
          }
        },
        'image/webp',
        0.8
      );
    }, 100);

    return () => {
      scene.remove(container);
      clearTimeout(timeout);
    };
  }, [model, gl, scene, camera, onGenerated]);

  return (
    <>
      <ambientLight intensity={2.0} />
      <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
    </>
  );
}

export function AssetThumbnail({ file }: { file: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

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
    <div className="w-32 h-32 flex items-center justify-center relative rounded-lg overflow-hidden">
      <Canvas
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true,
        }}
        shadows
        dpr={1}
        orthographic
        camera={{ zoom: 60, position: [5, 5, 5] }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <Suspense fallback={null}>
          <SceneToImage file={file} onGenerated={setImgUrl} />
        </Suspense>
      </Canvas>

      <div className="animate-pulse text-[10px] text-white/40">CHERCHE...</div>
    </div>
  );
}
