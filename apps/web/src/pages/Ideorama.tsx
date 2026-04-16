/* eslint-disable react-hooks/exhaustive-deps */
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
  Undo2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useSnapshot } from 'valtio';

import Scene from '@/components/3d-scene';
import { AssetThumbnail } from '@/components/assets/AssetThumbnail';
import { SuperButton } from '@/components/common/button';
import ResetIdeoramaDialog from '@/components/ideorama/resetIdeoramaDialog';
import { AssetsPanel } from '@/components/panels/AssetsPanel';
import { ObjectListPanel } from '@/components/panels/ObjectListPanel';
import { SettingPanel } from '@/components/panels/SettingPanel';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useUser } from '@/providers/UserProvider';
import { searchIdeorama, autoSaveIdeorama } from '@/services/ideorama.service';
import { actions, sceneState } from '@/stores';

/**
 * Safely serializes a value, filtering out circular references, Promises, and functions
 */
const createReplacer = () => {
  const visited = new WeakSet();
  return (_key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (visited.has(value)) {
        return undefined;
      }
      visited.add(value);
    }
    if (value instanceof Promise || typeof value === 'function') {
      return undefined;
    }
    return value;
  };
};

const downloadAndSaveIdeorama = () => {
  try {
    const serializable = {
      global: sceneState.global,
      background: sceneState.background,
      info: sceneState.info,
      floor: sceneState.floor,
      objects: sceneState.objects,
    };

    const jsonString = JSON.stringify(serializable, createReplacer());
    localStorage.setItem('sceneState', jsonString);
  } catch (err) {
    console.error('Failed to save scene state:', err);
  }
};

export default function Ideorama() {
  const snap = useSnapshot(sceneState);
  const { ideoramaid } = useParams();
  const isEditMode = snap.mode === 'edit';
  const userId = useUser().user?.id;

  const [activeAsset, setActiveAsset] = useState<any>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const isFirstRender = useRef(true);
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      const sceneData = localStorage.getItem('sceneState');
      autoSaveIdeorama(sceneData, ideoramaid, userId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [ideoramaid, userId]);

  useEffect(() => {
    return () => {
      const sceneData = localStorage.getItem('sceneState');
      autoSaveIdeorama(sceneData, ideoramaid, userId);
      sceneState.selectedObjectId = null;
      sceneState.history = [];
      sceneState.current = -1;
      sceneState.newest = 0;
    };
  }, []);

  useEffect(() => {
    if (!ideoramaid) return;
    searchIdeorama(ideoramaid)
      .then(res => {
        const model = res.data.model;
        if (!model) return;

        model.info.name = res.data.name;
        localStorage.setItem('sceneState', JSON.stringify(model));

        if (model.global) Object.assign(sceneState.global, model.global);
        if (model.background)
          Object.assign(sceneState.background, model.background);
        if (model.info) Object.assign(sceneState.info, model.info);
        if (model.floor) Object.assign(sceneState.floor, model.floor);
        if (model.objects) sceneState.objects = model.objects;
      })
      .then(() => actions.stackState());
  }, [ideoramaid]);

  useEffect(() => {
    if (!isFirstRender.current && !snap.isDragging) {
      downloadAndSaveIdeorama();
    }
  }, [snap.global, snap.background, snap.info, snap.floor, snap.objects]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!snap.isDragging) {
      downloadAndSaveIdeorama();
      actions.stackState();
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
        window.dispatchEvent(
          new CustomEvent('canvas-drop', {
            detail: {
              asset: draggedData,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            },
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
            <Button
              onClick={() => actions.setMode(isEditMode ? 'play' : 'edit')}
              className="p-2 main-small-btn"
            >
              {isEditMode ? (
                <span className="flex items-center gap-1">
                  <CirclePlay className="w-4 h-4 text-white" />
                  <span className="text-white">Jouer</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <SquarePen className="w-4 h-4 text-white" />
                  <span className="text-white">Modifier</span>
                </span>
              )}
            </Button>
            {snap.current != 0 && isEditMode && (
              <SuperButton
                tooltip="Revenir en arrière"
                voiceText="Revenir en arrière"
                onClick={() => actions.undo()}
                className="p-2 main-small-btn"
              >
                <span className="flex items-center gap-1">
                  <Undo2 className="w-4 h-4 text-white!" />
                </span>
              </SuperButton>
            )}
            {snap.current != snap.newest && isEditMode && (
              <SuperButton
                tooltip="Rétablir"
                voiceText="Rétablir"
                onClick={() => actions.redo()}
                className="p-2 main-small-btn"
              >
                <span className="flex items-center gap-1">
                  <Redo2 className="w-4 h-4 text-white!" />
                </span>
              </SuperButton>
            )}
            {isEditMode ? (
              <SuperButton
                tooltip="Réinitialiser"
                voiceText="Réinitialiser"
                onClick={() => {
                  setResetDialogOpen(true);
                }}
                className="z-50 p-2 main-small-btn"
              >
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-white!" />
                </span>
              </SuperButton>
            ) : null}
            <ResetIdeoramaDialog
              open={resetDialogOpen}
              onConfirm={() => {
                actions.resetIdeorama().then(res => {
                  if (res) {
                    toast.success('Idéorama réinitialisé');
                  } else {
                    toast.error(
                      "Échec lors de la réinitialisation de l'idéorama"
                    );
                  }
                });
                setResetDialogOpen(false);
              }}
              onCancel={() => {
                setResetDialogOpen(false);
              }}
            />
          </div>
          {/* Assets Button */}
          {isEditMode && (
            <SuperButton
              tooltip="Ajouter un objet"
              onClick={() => {
                actions.toggleAssetsPanel();
                actions.toggleAssetsTree(false);
              }}
              className="absolute md:bottom-6 bottom-15 left-10 -translate-x-1/2 z-50 main-small-btn size-12!"
            >
              <Plus className="size-8! text-white!" />
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
              className="absolute md:bottom-6 bottom-15 left-30 -translate-x-1/2 z-50 main-small-btn size-12!"
            >
              <ListTree className="size-8! text-white!" />
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
              className="absolute md:bottom-6 bottom-15 right-5 -translate-x-1/2 z-50 main-small-btn size-12!"
            >
              <Settings2 className="size-8! text-white!" />
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
