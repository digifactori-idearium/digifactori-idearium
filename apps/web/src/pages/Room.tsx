import { ContactShadows } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Settings } from 'lucide-react';

import { ConfigPanel } from '@/components/panel/ConfigPanel';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';

export default function Room() {
  return (
    <div className="flex lg:h-[calc(100dvh-100px)] lg:flex-row flex-col w-full overflow-hidden bg-[#0a0a0c] relative">
      <Sheet>
        <div className="absolute top-4 right-4 z-50">
          <SheetTrigger asChild>
            <button className="p-2 bg-mauve! rounded-full hover:bg-mauve! transition-all shadow-lg">
              <Settings size={32} className="text-white" />
            </button>
          </SheetTrigger>
        </div>

        <ConfigPanel />
      </Sheet>

      {/* 2. THE 3D LAYER (WebGL) */}
      <div className="w-full h-full overflow-hidden flex flex-col">
        <Canvas shadows camera={{ position: [0, 1.5, 0.8] }} className="flex-1">
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 2]} intensity={1} castShadow />
          <ContactShadows opacity={0.4} scale={10} blur={2} far={10} />
        </Canvas>
      </div>
    </div>
  );
}
