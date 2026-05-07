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
import { subscribe, useSnapshot } from 'valtio';
import { subscribeKey } from 'valtio/utils';

import Scene from '@/components/3d-scene';
import { AssetPreview } from '@/components/assets/AssetPreview';
import { SuperButton } from '@/components/common/button';
import ResetIdeoramaDialog from '@/components/dialog/AlertDialog';
import { AssetsPanel } from '@/components/panels/AssetsPanel';
import { ObjectListPanel } from '@/components/panels/ObjectListPanel';
import { SettingPanel } from '@/components/panels/SettingPanel';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useUser } from '@/providers/UserProvider';
import {
  beaconSaveIdeorama,
  getIdeoramaById,
  saveIdeorama,
} from '@/services/ideorama.service';
import { actions, sceneState } from '@/stores';
import { createReplacer } from '@/utils/utils';

const serializeScene = (): Record<string, unknown> | null => {
  try {
    return JSON.parse(
      JSON.stringify(
        {
          global: sceneState.global,
          background: sceneState.background,
          info: sceneState.info,
          floor: sceneState.floor,
          objects: sceneState.objects,
        },
        createReplacer()
      )
    );
  } catch (err) {
    console.error('Failed to serialize scene state:', err);
    return null;
  }
};

export default function Ideorama() {
  const mode = useSnapshot(sceneState).mode;
  const current = useSnapshot(sceneState).current;
  const newest = useSnapshot(sceneState).newest;

  const isEditMode = mode === 'edit';

  const { ideoramaid } = useParams<{ ideoramaid: string }>();

  const { user } = useUser();

  const [activeAsset, setActiveAsset] = useState<any>(null);
  const [ideoramaUserId, setIdeoramaUserId] = useState('');

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

  //Save
  const performSave = useCallback(async () => {
    if (!ideoramaid) return;
    if (isSaving.current) {
      pendingSave.current = true;
      return;
    }

    const scene = serializeScene();
    if (!scene) return;

    localStorage.setItem('sceneState', JSON.stringify(scene));

    isSaving.current = true;
    try {
      const success = await saveIdeorama(ideoramaid, scene);
      if (!success) toast.error('Échec de la sauvegarde automatique');
    } catch {
      toast.error('Erreur lors de la sauvegarde automatique');
    } finally {
      isSaving.current = false;
      if (pendingSave.current) {
        pendingSave.current = false;
        performSave();
      }
    }
  }, [ideoramaid]);

  // save on tab close or refresh
  const performBeaconSave = useCallback(() => {
    if (!ideoramaid) return;
    const scene = serializeScene();
    if (!scene) return;

    try {
      localStorage.setItem('sceneState', JSON.stringify(scene));
    } catch (err) {
      console.warn('localStorage quota exceeded on unload:', err);
    }

    beaconSaveIdeorama(ideoramaid, scene);
  }, [ideoramaid]);

  // Periodic save (every 30 s)
  useEffect(() => {
    if (!ideoramaid) return;
    periodicSaveRef.current = setInterval(performSave, 30_000);
    return () => {
      if (periodicSaveRef.current) clearInterval(periodicSaveRef.current);
    };
  }, [ideoramaid, performSave]);

  // Save on unload / tab hide
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
      sceneState.mode = 'play';
    };
  }, [performBeaconSave]);

  // Load
  useEffect(() => {
    if (!ideoramaid) return;

    isLoadingData.current = true;
    getIdeoramaById(ideoramaid)
      .then(res => {
        const record = res.data as any;
        const scene = record.scene as ModelsInfo;

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
        isLoadingData.current = false;
      })
      .catch(err => {
        console.error('[LoadIdeorama] Failed:', err);
        toast.error('Erreur lors du chargement du idéorama');
        isLoadingData.current = false;
      });
  }, [ideoramaid]);

  // Auto-save on state change
  useEffect(() => {
    const unsub = subscribe(sceneState, () => {
      if (isLoadingData.current || sceneState.isDragging) return;
      localStorage.setItem('sceneState', JSON.stringify(serializeScene()));
      performSave();
    });
    return unsub;
  }, [performSave]);

  useEffect(() => {
    const unsub = subscribeKey(sceneState, 'isDragging', isDragging => {
      if (isLoadingData.current) return;
      if (!isDragging) {
        localStorage.setItem('sceneState', JSON.stringify(serializeScene()));
        performSave();
        actions.stackState();
      }
    });
    return unsub;
  }, [performSave]);

  // DnD handlers
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
        <div className="w-full h-full flex flex-col">
          <Scene />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
            {(user?.role == 'SUPERVISOR' ||
              user?.role == 'ADMIN' ||
              user?.id == ideoramaUserId) && (
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
            )}

            {current != 0 && isEditMode && (
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

            {current != newest && isEditMode && (
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
            {isEditMode && (
              <ResetIdeoramaDialog
                trigger={
                  <SuperButton
                    tooltip="Réinitialiser"
                    voiceText="Réinitialiser"
                    className="z-50 p-2 main-small-btn"
                  >
                    <span className="flex items-center gap-1">
                      <RotateCcw className="w-4 h-4 text-white!" />
                    </span>
                  </SuperButton>
                }
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
                }}
                onCancel={() => {}}
              />
            )}
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
              <AssetPreview
                fileKey={
                  activeAsset.thumbnailUrl ||
                  activeAsset.thumbnail ||
                  activeAsset.fileUrl ||
                  activeAsset.file
                }
              />
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
