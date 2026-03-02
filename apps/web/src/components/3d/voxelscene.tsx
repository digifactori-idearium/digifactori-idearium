import { useState, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Palette de couleurs
const colors = [
    '#f97316', // orange
    '#3b82f6', // bleu
    '#10b981', // vert
    '#ef4444', // rouge
    '#facc15', // jaune
    '#8b5cf6', // violet
];

// Voxel individuel
function Voxel({
    position,
    selectedColor,
}: {
    position: [number, number, number];
    selectedColor: string;
}) {
    const [color, setColor] = useState('#f97316');

    return (
        <mesh
            position={position}
            onClick={(e) => {
                e.stopPropagation(); // évite de déclencher d'autres handlers
                setColor(selectedColor);
            }}
        >
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

// Grille de voxels
function VoxelGrid({ selectedColor }: { selectedColor: string }) {
    const size = 5;
    const voxels = [];

    for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
            voxels.push(
                <Voxel
                    key={`${x}-${z}`}
                    position={[x - size / 2, 0, z - size / 2]}
                    selectedColor={selectedColor}
                />
            );
        }
    }

    return <>{voxels}</>;
}

// Hook pour rendre le Canvas responsive
function ResponsiveCanvas({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setSize({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative">
            {size.width > 0 && size.height > 0 && (
                <Canvas
                    style={{ width: size.width, height: size.height }}
                    camera={{ position: [5, 5, 5], fov: 60 }}
                >
                    {children}
                </Canvas>
            )}
        </div>
    );
}

// Composant principal
export default function VoxelScene() {
    const [selectedColor, setSelectedColor] = useState(colors[0]);

    return (
        <div className="w-full h-full relative rounded-xl overflow-hidden border">
            {/* Canvas responsive */}
            <ResponsiveCanvas>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={1} />
                <VoxelGrid selectedColor={selectedColor} />
                <OrbitControls enablePan={false} />
            </ResponsiveCanvas>

            {/* HUD flottant semi-transparent */}
            <div
                className="absolute top-4 right-4 flex flex-col gap-3 p-3 bg-black/50 rounded-lg shadow-lg"
            >
                {colors.map((c) => (
                    <div
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`w-10 h-10 rounded cursor-pointer border-2 ${selectedColor === c ? 'border-white' : 'border-gray-600'
                            }`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
        </div>
    );
}