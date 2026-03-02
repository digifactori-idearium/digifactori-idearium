import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

/**
 * Un voxel individuel
 */
function Voxel({
    position,
}: {
    position: [number, number, number];
}) {
    const [color, setColor] = useState('#f97316'); // orange Tailwind

    return (
        <mesh
            position={position}
            onClick={() =>
                setColor('#' + Math.floor(Math.random() * 16777215).toString(16))
            }
        >
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

/**
 * Grille de voxels
 */
function VoxelGrid() {
    const size = 5; // grille 5x5
    const voxels = [];

    for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
            voxels.push(
                <Voxel
                    key={`${x}-${z}`}
                    position={[
                        x - size / 2,
                        0,
                        z - size / 2,
                    ]}
                />
            );
        }
    }

    return <>{voxels}</>;
}

/**
 * Scène principale
 */
export default function VoxelScene() {
    return (
        <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1} />

            <VoxelGrid />

            <OrbitControls enablePan={false} />
        </Canvas>
    );
}