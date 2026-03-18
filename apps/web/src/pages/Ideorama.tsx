import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import {
  ArrowDownToLine,
  CirclePlay,
  ListTree,
  Plus,
  RotateCcw,
  Settings2,
  SquarePen,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useSnapshot } from 'valtio';

import Scene from '@/components/3d';
import { AssetThumbnail } from '@/components/assets/AssetThumbnail';
import { AssetsPanel } from '@/components/panel/AssetsPanel';
import { ObjectListPanel } from '@/components/panel/ObjectListPanel';
import { SettingPanel } from '@/components/panel/SettingPanel';
import { useUser } from '@/providers/UserProvider';
import { getEmptyIdeorama, saveIdeorama } from '@/services/ideorama.service';
import { actions, sceneState } from '@/stores';

const downloadAndSaveIdeorama = (
  ideoramaId: string | undefined,
  userId: string | undefined
) => {
  saveIdeorama(JSON.stringify(sceneState.objects), ideoramaId, userId);
      toast.success("Sauvegarde de l'idéorama réussie");
};

const resetIdeorama = () => {
  getEmptyIdeorama().then(res => {
    const model = res.data.model;
    sceneState.objects = model
    toast.success('Idéorama réinitialisé');
  });
};

export default function Ideorama() {
  const snap = useSnapshot(sceneState);

  const { ideoramaid } = useParams();

  const isEditMode = snap.mode === 'edit';
  const userId = useUser().user?.id;

  const [activeAsset, setActiveAsset] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // useEffect(() => {

  //   const exporter = new GLTFExporter();
  //   if(sceneRef.current) {
  //     exporter.parse(
  //       scene,
  //       () => {
  //         saveIdeorama(JSON.stringify(sceneState.objects), ideoramaid, userId)
  //         toast.success('Sauvegarde de l\'idéorama réussie');
  //       },
  //       { binary: false }
  //     );
  // }
  //   console.log("cc", sceneRef.current)
  // }, [snap.objects])

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
          <Scene/>
          <button
            onClick={() => actions.setMode(isEditMode ? 'play' : 'edit')}
            className="absolute top-3 left-[calc(50%-80px)] z-50 p-2! main-small-btn"
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
            onClick={() =>
              downloadAndSaveIdeorama(ideoramaid, userId)
            }
            className="absolute top-3 left-[calc(50%)] z-50 p-2! main-small-btn"
          >
            <span className="flex items-center gap-1">
              <ArrowDownToLine className="w-4 h-4 text-white!" />
              <span>Sauvegarder</span>
            </span>
          </button>
          <button
            onClick={() => resetIdeorama()}
            className="absolute top-3 left-[calc(50%+125px)] z-50 p-2! main-small-btn"
          >
            <span className="flex items-center gap-1">
              <RotateCcw className="w-4 h-4 text-white!" />
              <span>Réinitialiser</span>
            </span>
          </button>
          {/* Assets Button */}
          {isEditMode && (
            <button
              onClick={() => {
                actions.toggleAssetsPanel();
                actions.toggleAssetsTree(false);
              }}
              className="absolute md:bottom-6 bottom-15 left-10 -translate-x-1/2 z-50 main-small-btn p-3!"
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
              className="absolute md:bottom-6 bottom-15 left-25 -translate-x-1/2 z-50 main-small-btn p-3!"
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
              className="absolute md:bottom-6 bottom-15 right-5 -translate-x-1/2 z-50 main-small-btn p-3!"
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
