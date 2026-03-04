import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Mesh } from 'three';

export const AnimatedBox: React.FC = () => {
  const boxRef = useRef<Mesh>(null);

  const [wireframe, setWireframe] = useState(false);

  const handleClick = () => {
    setWireframe(!wireframe);
  };

  useFrame(() => {
    if (boxRef.current) {
      boxRef.current.rotation.x += 0.005;
      boxRef.current.rotation.x += 0.005;
      boxRef.current.rotation.x += 0.005;
    }
  });

  return (
    <mesh
      name="bob"
      castShadow
      position={[39, 39, 39]}
      ref={boxRef}
      onClick={handleClick}
    >
      <boxGeometry args={[10, 10, 10]} />
      <meshStandardMaterial color={'yellow'} wireframe={wireframe} />
    </mesh>
  );
};
