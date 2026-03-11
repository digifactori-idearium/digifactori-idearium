import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CirclePlay, ListTree, Plus, SquarePen } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { useSnapshot } from 'valtio';


import Scene from '@/components/3d';
import { AssetThumbnail } from '@/components/assets/AssetThumbnail';
import { AssetsPanel } from '@/components/panel/AssetsPanel';
import { ConfigPanel } from '@/components/panel/ConfigPanel';
import { ObjectListPanel } from '@/components/panel/ObjectListPanel';
import { ObjectConfigPanel } from '@/components/panel/ObjectPanel';
import { useUser } from '@/providers/UserProvider';
import { saveIdeorama } from '@/services/ideorama.service';
import { actions, sceneState } from '@/stores';

const DownloadAndSaveIdeorama = (scene: any, userId: string|undefined) => {

    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result: any) => {
        // const blob = new Blob([JSON.stringify(result)], { type: "application/json" });
        console.log("saving...")
        // saveIdeorama(scene.toJSON(), userId).then(res => {sceneState.id = res.data.id; console.log("sceneState.id: ", sceneState.id)})
        saveIdeorama(scene.toJSON(), userId).then(res => {console.log("sceneState.id: ", sceneState.id)})

      },
      { binary: false }
    );
}

export default function Ideorama() {
  const snap = useSnapshot(sceneState);
   const sceneRef = useRef(null);

  const isEditMode = snap.mode === 'edit';
  const selectedObject = snap.selectedObjectId;
  const userId = useUser().user?.id;


  const [activeAsset, setActiveAsset] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveAsset(event.active.data.current);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { over, activatorEvent } = event;
    const draggedData = event.active.data.current;

    if (over?.id === 'canvas-droppable' && draggedData) {
      let clientX = 0;
      let clientY = 0;

      if (activatorEvent instanceof MouseEvent) {
        clientX = activatorEvent.clientX;
        clientY = activatorEvent.clientY;
      } else if (window.TouchEvent && activatorEvent instanceof TouchEvent) {
        clientX = (activatorEvent as TouchEvent).changedTouches[0].clientX;
        clientY = (activatorEvent as TouchEvent).changedTouches[0].clientY;
      }

      window.dispatchEvent(
        new CustomEvent('canvas-drop', {
          detail: { asset: draggedData, x: clientX, y: clientY },
        })
      );
    }
    setActiveAsset(null);
  }, []);
  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <div className="flex lg:h-full lg:flex-row flex-col w-full overflow-hidden relative">
        <div className="w-full h-full overflow-hidden flex flex-col">
          <Scene sceneRef={sceneRef}/>
          <button
            onClick={() => actions.setMode(isEditMode ? 'play' : 'edit')}
            className="absolute top-3 left-[calc(50%-100px)] z-50 p-2! main-small-btn"
          >
            {isEditMode ? (
              <span className="flex items-center gap-1">
                <CirclePlay className="w-4 h-4 text-white!" />
                <span>Jouer</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <SquarePen className="w-4 h-4 text-white!" />
                <span>Modifier</span>
              </span>
            )}
          </button>
          <button
            onClick={() => actions.addObject('table')}
            className="absolute top-3 left-1/2 z-50 p-2! main-small-btn"
          >
            <span className="flex items-center gap-1">
              <Plus className="w-4 h-4 text-white!" />
              <span>Add object</span>
            </span>
          </button>
          {/* Assets Button */}
          {isEditMode && (
            <button
              onClick={() => {
                actions.toggleAssetsPanel();
                actions.toggleAssetsTree(false);
              }}
              className="absolute bottom-6 left-10 -translate-x-1/2 z-50 main-small-btn p-3!"
            >
              <Plus className="w-5 h-5 text-white!" />
            </button>
          )}
          {isEditMode && <AssetsPanel />}

          {/* Tree Explorer */}
          {isEditMode && (
            <button
              onClick={() => {
                actions.toggleAssetsTree();
                actions.toggleAssetsPanel(false);
              }}
              className="absolute bottom-6 left-25 -translate-x-1/2 z-50 main-small-btn p-3!"
            >
              <ListTree className="w-5 h-5 text-white!" />
            </button>
            
          )}
          {isEditMode && <ObjectListPanel />}
          <button
          onClick={() => DownloadAndSaveIdeorama(sceneRef.current, userId)}
          className="absolute top-3 left-1/2 z-50 p-2! main-small-btn"
        ></button>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeAsset ? (
            <div className="w-full h-full rounded-xl border shadow-2xl overflow-hidden cursor-grabbing opacity-80 p-0 flex items-center justify-center">
              <AssetThumbnail file={activeAsset.file} />
            </div>
          ) : null}
        </DragOverlay>

        {/* Right Panel */}
        {isEditMode && (
          <aside className="fixed right-3 top-20 bottom-3 w-80 z-50 animate-in slide-in-from-right duration-500">
            <div className="h-full w-full flex flex-col backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden text-white">
              {selectedObject ? <ObjectConfigPanel /> : <ConfigPanel />}
            </div>
          </aside>
        )}
      </div>
    </DndContext>
  );
}
