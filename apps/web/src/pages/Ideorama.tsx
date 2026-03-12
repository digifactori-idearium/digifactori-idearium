import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { CirclePlay, ListTree, Plus, Settings2, SquarePen } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useSnapshot } from 'valtio';

import Scene from '@/components/3d';
import { AssetThumbnail } from '@/components/assets/AssetThumbnail';
import { AssetsPanel } from '@/components/panel/AssetsPanel';
import { ObjectListPanel } from '@/components/panel/ObjectListPanel';
import { SettingPanel } from '@/components/panel/SettingPanel';
import { sceneState, actions } from '@/stores';
export default function Ideorama() {
  const snap = useSnapshot(sceneState);

  const isEditMode = snap.mode === 'edit';

  const [activeAsset, setActiveAsset] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveAsset(event.active.data.current);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { over, active } = event;
    const draggedData = active.data.current;

    if (over?.id === 'canvas-droppable' && draggedData) {
      const rect = active.rect.current.translated;

      if (rect) {
        const clientX = rect.left + rect.width / 2;

        const clientY = rect.top + rect.height / 2;

        window.dispatchEvent(
          new CustomEvent('canvas-drop', {
            detail: { asset: draggedData, x: clientX, y: clientY },
          })
        );
      }
    }

    setActiveAsset(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <div className="flex h-full lg:flex-row flex-col w-full overflow-hidden relative">
        <div className="w-full h-full overflow-hidden flex flex-col">
          <Scene />
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

          {/* Right Panel */}
          {isEditMode && (
            <button
              onClick={() => {
                actions.toggleSettingPanel();
              }}
              className="absolute bottom-3 right-5 -translate-x-1/2 z-50 main-small-btn p-3!"
            >
              <Settings2 className="w-5 h-5 text-white!" />
            </button>
          )}
          {isEditMode && <SettingPanel />}
        </div>

        <DragOverlay
          dropAnimation={null}
          adjustScale={false}
          modifiers={[snapCenterToCursor]}
          style={{ pointerEvents: 'none', cursor: 'grabbing' }}
        >
          {activeAsset && (
            <div className="w-24 h-24 cursor-grabbing rounded-xl overflow-hidden opacity-90 flex items-center justify-center">
              {activeAsset.thumbnail ? (
                <img
                  src={activeAsset.thumbnail}
                  alt="Dragging Asset"
                  className="w-full h-full object-contain"
                />
              ) : (
                <AssetThumbnail file={activeAsset.file} />
              )}
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
