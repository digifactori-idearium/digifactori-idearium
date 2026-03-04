import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function RoomHexagon() {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame(() => {
        meshRef.current.rotation.y += 0.003;
    });

    return (
        <mesh
            ref={meshRef}
            onClick={() => alert('Room clicked')}
            onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
                e.object.scale.set(1.1, 1.1, 1.1);
            }}
            onPointerOut={(e) => {
                document.body.style.cursor = 'default';
                e.object.scale.set(1, 1, 1);
            }}
        >
            <cylinderGeometry args={[0.7, 0.7, 0.3, 6]} />
            <meshStandardMaterial color="#ec4899" />
        </mesh>
    );
}

const RoomsPlayground = () => {
    return (
        <div className="w-full h-screen">
            <Canvas camera={{ position: [4, 4, 4], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <RoomHexagon />
            </Canvas>
        </div>
    );
};

export default RoomsPlayground;