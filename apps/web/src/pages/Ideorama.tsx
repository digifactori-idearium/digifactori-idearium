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
import AlertDialog from '@/components/dialog/AlertDialog';
import { AssetsPanel } from '@/components/panels/AssetsPanel';
import { ObjectListPanel } from '@/components/panels/ObjectListPanel';
import { SettingPanel } from '@/components/panels/SettingPanel';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { resolveAssetUrl, resolveThumbnailUrl } from '@/lib/asset';
import { useUser } from '@/providers/UserProvider';
import {
  autoSaveIdeorama,
  beaconSaveIdeorama,
  searchIdeorama,
} from '@/services/ideorama.service';
import { actions, sceneState } from '@/stores';
import { createReplacer } from '@/utils/utils';

/** Serializes the current sceneState to a JSON string. */
const serializeScene = (): string | null => {
  try {
    const serializable = {
      global: sceneState.global,
      background: sceneState.background,
      info: sceneState.info,
      floor: sceneState.floor,
      objects: sceneState.objects,
    };
    return JSON.stringify(serializable, createReplacer());
  } catch (err) {
    console.error('Failed to serialize scene state:', err);
    return null;
  }
};

/** Writes the latest scene state to localStorage. */
const saveSceneToLocalStorage = () => {
  const json = serializeScene();
  if (json) localStorage.setItem('sceneState', json);
};

export default function Ideorama() {
  const snap = useSnapshot(sceneState);
  const { ideoramaid } = useParams();
  const isEditMode = snap.mode === 'edit';
  const userId = useUser().user?.id;

  const [activeAsset, setActiveAsset] = useState<any>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Guards the save effects to execute during the initial data load.
  const isLoadingData = useRef(true);

  const isSaving = useRef(false);
  const pendingSave = useRef(false);
  const periodicSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const getLatestSceneJson = useCallback((): string | null => {
    return serializeScene();
  }, []);

  const performSave = useCallback(async () => {
    if (!ideoramaid || !userId) {
      console.warn('[AutoSave] Skipped — missing ideoramaid or userId', {
        ideoramaid,
        userId,
      });
      return;
    }

    if (isSaving.current) {
      pendingSave.current = true;
      return;
    }

    const json = getLatestSceneJson();
    if (!json) return;

    localStorage.setItem('sceneState', json);

    isSaving.current = true;
    try {
      const success = await autoSaveIdeorama(json, ideoramaid, userId);
      if (!success) {
        toast.error('Échec de la sauvegarde automatique');
      }
    } catch {
      toast.error('Erreur lors de la sauvegarde automatique');
    } finally {
      isSaving.current = false;
      if (pendingSave.current) {
        pendingSave.current = false;
        performSave();
      }
    }
  }, [ideoramaid, userId, getLatestSceneJson]);

  const performBeaconSave = useCallback(() => {
    if (!ideoramaid || !userId) return;
    const json = getLatestSceneJson();
    if (!json) return;
    try {
      localStorage.setItem('sceneState', json);
    } catch (storageError) {
      console.warn('localStorage quota exceeded on unload:', storageError);
    }
    beaconSaveIdeorama(json, ideoramaid, userId);
  }, [ideoramaid, userId, getLatestSceneJson]);

  //  auto-save every 30 seconds
  useEffect(() => {
    if (!ideoramaid || !userId) return;
    periodicSaveRef.current = setInterval(() => {
      performSave();
    }, 30_000);
    return () => {
      if (periodicSaveRef.current) clearInterval(periodicSaveRef.current);
    };
  }, [ideoramaid, userId, performSave]);

  // Save on page unload / tab close / navigation away
  useEffect(() => {
    const handleBeforeUnload = () => performBeaconSave();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') performBeaconSave();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      performBeaconSave();

      sceneState.selectedObjectId = null;
      sceneState.history = [];
      sceneState.current = -1;
      sceneState.newest = 0;
    };
  }, [performBeaconSave]);

  // Load ideorama
  useEffect(() => {
    if (!ideoramaid) return;

    isLoadingData.current = true;

    searchIdeorama(ideoramaid)
      .then(res => {
        const record = res.data as any;
        const scene = record.scene as ModelsInfo | null;

        if (!scene) {
          throw new Error(`No scene data in DB for ideorama "${ideoramaid}"`);
        }

        if (record.name) scene.info = { ...scene.info, name: record.name };
        if (typeof record.isPublic === 'boolean') {
          scene.global = { ...scene.global, isPublic: record.isPublic };
        }

        return scene;
      })
      .then((model: ModelsInfo) => {
        localStorage.setItem('sceneState', JSON.stringify(model));

        if (model.global) Object.assign(sceneState.global, model.global);
        if (model.background)
          Object.assign(sceneState.background, model.background);
        if (model.info) Object.assign(sceneState.info, model.info);
        if (model.floor) Object.assign(sceneState.floor, model.floor);
        if (model.objects) sceneState.objects = model.objects;

        actions.stackState();

        // do saving only after all mutations are committed.
        isLoadingData.current = false;
      })
      .catch(err => {
        console.error('[LoadIdeorama] Failed:', err);
        toast.error('Erreur lors du chargement du idéorama');
        isLoadingData.current = false;
      });
  }, [ideoramaid]);

  // Save on every meaningful state change in the local storage
  useEffect(() => {
    if (isLoadingData.current || snap.isDragging) return;
    saveSceneToLocalStorage();
    performSave();
  }, [snap.global, snap.background, snap.info, snap.floor, snap.objects]);

  // After a drag-drop completes, save + push undo history.
  useEffect(() => {
    if (isLoadingData.current) return;
    if (!snap.isDragging) {
      saveSceneToLocalStorage();
      performSave();
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
                onClick={() => setResetDialogOpen(true)}
                className="z-50 p-2 main-small-btn"
              >
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-white!" />
                </span>
              </SuperButton>
            ) : null}
            <AlertDialog
              open={resetDialogOpen}
              description="Cela réinitialisera votre ideorama"
              confirmationMessage="Oui, réinitialiser"
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
              onCancel={() => setResetDialogOpen(false)}
            />
          </div>

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

          {isEditMode && (
            <SuperButton
              tooltip="Personnalise ton ideorama"
              onClick={() => actions.toggleSettingPanel()}
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
              {resolveThumbnailUrl(
                activeAsset.thumbnail,
                activeAsset.thumbnailUrl
              ) ? (
                <img
                  src={resolveThumbnailUrl(
                    activeAsset.thumbnail,
                    activeAsset.thumbnailUrl
                  )}
                  alt="Dragging Asset"
                  className="w-full h-full object-contain"
                />
              ) : (
                <AssetThumbnail
                  file={resolveAssetUrl(activeAsset.file, activeAsset.fileUrl)}
                />
              )}
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
