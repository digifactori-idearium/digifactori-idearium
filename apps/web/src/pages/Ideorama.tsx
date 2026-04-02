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
  Redo2,
  RotateCcw,
  Settings2,
  SquarePen,
  Undo2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useSnapshot } from 'valtio';

import Scene from '@/components/3d';
import { AssetThumbnail } from '@/components/assets/AssetThumbnail';
import { AssetsPanel } from '@/components/panel/AssetsPanel';
import { ObjectListPanel } from '@/components/panel/ObjectListPanel';
import { SettingPanel } from '@/components/panel/SettingPanel';
import { useUser } from '@/providers/UserProvider';
import { saveIdeorama, searchIdeorama } from '@/services/ideorama.service';
import { actions, sceneState } from '@/stores';

const downloadAndSaveIdeorama = (
  setIsSaving: (arg: boolean) => void
) => {
  setIsSaving(true)
  localStorage.setItem("sceneState", JSON.stringify({
      global: sceneState.global,
      background: sceneState.background,
      info: sceneState.info,
      floor: sceneState.floor,
      objects: sceneState.objects,
    }))
  // toast.success("Sauvegarde de l'idéorama réussie");
  setIsSaving(false)
};

export default function Ideorama() {
  const snap = useSnapshot(sceneState);

  const { ideoramaid } = useParams();

  const isEditMode = snap.mode === 'edit';
  const userId = useUser().user?.id;

  const [activeAsset, setActiveAsset] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false)
  const [isFirstRender, setIsFirstRender] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

   useEffect(() => {
    console.log("snap: ", snap)
  }, [snap])

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveIdeorama(localStorage.getItem("sceneState"), ideoramaid, userId);
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveIdeorama(localStorage.getItem("sceneState"), ideoramaid, userId);
    }
  }, [])

   useEffect(() => {
      if (!ideoramaid) return;
    
      searchIdeorama(ideoramaid).then(res => {
        localStorage.setItem("sceneState", JSON.stringify(res.data.model))
        res.data.model.info.name = res.data.name
        const model = res.data.model;
        if (!model) return;
  
        if (model.global) Object.assign(sceneState.global, model.global);
        if (model.background)
          Object.assign(sceneState.background, model.background);
        if (model.info) Object.assign(sceneState.info, model.info);
        if (model.floor) Object.assign(sceneState.floor, model.floor);
        if (model.objects) sceneState.objects = model.objects;
        
      }).then(() => {
        actions.stackState();
    })
    }, [ideoramaid]);
  
  useEffect(() => {
    if (!isFirstRender && !snap.isDragging) {
      downloadAndSaveIdeorama(setIsSaving) 
    }
  }, [snap.global, snap.background, snap.info, snap.floor, snap.objects])


  useEffect(() => {
    if (!isFirstRender && !snap.isDragging) {
      downloadAndSaveIdeorama(setIsSaving)
      actions.stackState()
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFirstRender(false);
    }
  }, [snap.isDragging])

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
          {!isSaving && <button
            onClick={() =>
              downloadAndSaveIdeorama(setIsSaving)
            }
            className="absolute top-3 left-[calc(50%)] z-50 p-2! main-small-btn"
          >
            <span className="flex items-center gap-1">
              <ArrowDownToLine className="w-4 h-4 text-white!" />
              <span>Sauvegarder</span>
            </span>
          </button>}
          {isSaving && <button
            className="absolute top-3 left-[calc(50%)] z-50 p-2! main-small-btn"
          >
            <span className="flex items-center gap-1">
              <ArrowDownToLine className="w-4 h-4 text-white!" />
              <span>En train de sauvegarder</span>
            </span>
          </button>}
          {snap.current != snap.oldest && <button
            // onClick={() => undo(ideoramaStates, setIdeoramaStates, setIsUndoOrRedoing)}
            onClick={() => actions.undo()}
            className="absolute top-3 left-[calc(50%+125px)] z-50 p-2! main-small-btn"
          >
            <span className="flex items-center gap-1">
              <Undo2 className="w-4 h-4 text-white!" />
              <span>Undo </span>
            </span>
          </button>}
          {snap.current != snap.newest && <button
            // onClick={() => redo(ideoramaStates, setIdeoramaStates, setIsUndoOrRedoing)}
            onClick={() => actions.redo()}
            className="absolute top-3 left-[calc(50%+205px)] z-50 p-2! main-small-btn"
          >
            <span className="flex items-center gap-1">
              <Redo2 className="w-4 h-4 text-white!" />
              <span>Redo</span>
            </span>
          </button>}
          <button
            onClick={() => {
              actions.resetIdeorama().then(res => {
              if (res)
                {toast.success('Idéorama réinitialisé');}
              else 
                {toast.error('Échec lors de la réinitialisation de l\'idéorama')}
            })}}
            className="absolute top-3 left-[calc(50%+285px)] z-50 p-2! main-small-btn"
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
