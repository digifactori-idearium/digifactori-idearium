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
  CirclePlay,
  ListTree,
  Plus,
  Redo2,
  RotateCcw,
  Settings2,
  SquarePen,
  Undo2
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useSnapshot } from 'valtio';

import Scene from '@/components/3d';
import { AssetThumbnail } from '@/components/assets/AssetThumbnail';
import { SuperButton } from '@/components/global';
import { AssetsPanel } from '@/components/panel/AssetsPanel';
import { ObjectListPanel } from '@/components/panel/ObjectListPanel';
import { SettingPanel } from '@/components/panel/SettingPanel';
import { useSidebar } from '@/components/ui/sidebar';
import { useUser } from '@/providers/UserProvider';
import { saveIdeorama, searchIdeorama } from '@/services/ideorama.service';
import { actions, sceneState } from '@/stores';

const downloadAndSaveIdeorama = () => {
  localStorage.setItem(
    'sceneState',
    JSON.stringify({
      global: sceneState.global,
      background: sceneState.background,
      info: sceneState.info,
      floor: sceneState.floor,
      objects: sceneState.objects,
    })
  );
};

export default function Ideorama() {
  const snap = useSnapshot(sceneState);

  const { ideoramaid } = useParams();

  const isEditMode = snap.mode === 'edit';
  const userId = useUser().user?.id;

  const [activeAsset, setActiveAsset] = useState<any>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    console.log("history: ", snap.history)
  }, [snap.history])

  const selectedObject = snap.selectedObjectId ? snap.objects[snap.selectedObjectId] :  null
  const scale = selectedObject?.transform.scale

//   const timeoutRef = useRef(100);

// useEffect(() => {
//   clearTimeout(timeoutRef.current);

//   timeoutRef.current = setTimeout(() => {
//     actions.stackState();
//   }, 200);

//   return () => clearTimeout(timeoutRef.current);
// }, [scale]);
  
  // useEffect(() => {
  //   const handleScaleUpdate = () => {
  //     console.log("stacked")
  //     actions.stackState();
  //   }
  //   const slider = document.getElementById("scale_slider_ext") as HTMLElement
  //   console.log("slider: ", slider)
  //   if (slider) {
  //     slider.addEventListener("change", handleScaleUpdate)
  //   }
    
  //   // return () => slider.removeEventListener("change", handleScaleUpdate)
  // }, [snap.activeSettingView])

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveIdeorama(localStorage.getItem("sceneState"), ideoramaid, userId);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveIdeorama(localStorage.getItem("sceneState"), ideoramaid, userId);
      sceneState.selectedObjectId = null;
      sceneState.history = [];
      sceneState.current = -1;
      sceneState.newest = 0;
      sceneState.oldest = 0;
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
      downloadAndSaveIdeorama() 
    }
  }, [snap.global, snap.background, snap.info, snap.floor, snap.objects])


  useEffect(() => {
    if (!isFirstRender && !snap.isDragging) {
      downloadAndSaveIdeorama()
      actions.stackState()
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFirstRender(false);
    }
  }, [snap.isDragging]);

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
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
            <button
              onClick={() => actions.setMode(isEditMode ? 'play' : 'edit')}
              className="p-2 main-small-btn"
            >
              {isEditMode ? (
                <span className="flex items-center gap-1">
                  <CirclePlay className="w-4 h-4 text-white" />
                  <span>Jouer</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <SquarePen className="w-4 h-4 text-white" />
                  <span>Modifier</span>
                </span>
              )}
            </button>
            {(snap.current != snap.oldest && isEditMode) && (
              <SuperButton
                tooltip='Revenir en arrière'
                onClick={() => actions.undo()}
                className="p-2 main-small-btn"
              >
                <span className="flex items-center gap-1">
                  <Undo2 className="w-4 h-4 text-white!" />
                </span>
              </SuperButton>
            )}
            {(snap.current != snap.newest && isEditMode) && (
              <SuperButton
                tooltip='Rétablir'
                onClick={() => actions.redo()}
                className="p-2 main-small-btn"
              >
                <span className="flex items-center gap-1">
                  <Redo2 className="w-4 h-4 text-white!" />
                </span>
              </SuperButton>
            )}
            {isEditMode ? <SuperButton
              tooltip='Réinitialiser'
              onClick={() => {
                actions.resetIdeorama().then(res => {
                  if (res) {
                    toast.success('Idéorama réinitialisé');
                  } else {
                    toast.error(
                      "Échec lors de la réinitialisation de l'idéorama"
                    );
                  }
                });
              }}
              className="z-50 p-2 main-small-btn"
            >
              <span className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4 text-white!" />
              </span>
            </SuperButton> : null}
          </div>
          {/* Assets Button */}
          {isEditMode && (
            <SuperButton
              tooltip="Ajouter un objet"
              onClick={() => {
                actions.toggleAssetsPanel();
                actions.toggleAssetsTree(false);
              }}
              className="absolute md:bottom-6 bottom-15 left-10 -translate-x-1/2 z-50 main-small-btn p-3!"
            >
              <Plus className="w-5 h-5 text-white!" />
            </SuperButton>
          )}
          {isEditMode && <AssetsPanel />}

          {/* Tree Explorer */}
          {isEditMode && (
            <SuperButton
              tooltip="Explorez vos objets"
              onClick={() => {
                actions.toggleAssetsTree();
                actions.toggleAssetsPanel(false);
              }}
              className="absolute md:bottom-6 bottom-15 left-25 -translate-x-1/2 z-50 main-small-btn p-3!"
            >
              <ListTree className="w-5 h-5 text-white!" />
            </SuperButton>
          )}
          {isEditMode && <ObjectListPanel />}

          {/* Right Panel */}
          {isEditMode && (
            <SuperButton
              tooltip="Personnalise ton ideorama"
              onClick={() => {
                actions.toggleSettingPanel();
              }}
              className="absolute md:bottom-6 bottom-15 right-5 -translate-x-1/2 z-50 main-small-btn p-3!"
            >
              <Settings2 className="w-5 h-5 text-white!" />
            </SuperButton>
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
