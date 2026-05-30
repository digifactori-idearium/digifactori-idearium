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
import { useNavigate, useParams } from 'react-router-dom';
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
import { isNotFoundError } from '@/lib/api';
import { STATUS_COLOR, STATUS_LABEL } from '@/lib/constants';
import { useUser } from '@/providers/UserProvider';
import {
  getIdeoramaById,
  getSignedUrl,
  saveIdeorama,
} from '@/services/ideorama.service';
import { actions, sceneState } from '@/stores';
import { createReplacer } from '@/utils/utils';

const AUTOSAVE_DEBOUNCE_MS = 1500;

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

  const { ideoramaid } = useParams<{ ideoramaid: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [activeAsset, setActiveAsset] = useState<any>(null);
  const [ideoramaUserId, setIdeoramaUserId] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const canEdit =
    user?.role === 'SUPERVISOR' ||
    user?.role === 'ADMIN' ||
    user?.id === ideoramaUserId;

  const isEditMode = canEdit && mode === 'edit';

  // Refs
  const isLoadingData = useRef(true);
  const isSavingRef = useRef(false);
  const canEditRef = useRef(canEdit);
  const ideoramaidRef = useRef(ideoramaid);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstSubscribeRef = useRef(true);

  useEffect(() => {
    ideoramaidRef.current = ideoramaid;
  }, [ideoramaid]);
  useEffect(() => {
    canEditRef.current = canEdit;
  }, [canEdit]);

  const { setOpen } = useSidebar();
  useEffect(() => {
    setOpen(false);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Core save
  const performSave = useCallback(async () => {
    const id = ideoramaidRef.current;
    if (!id || isSavingRef.current || !canEditRef.current) return;

    const scene = serializeScene();
    if (!scene) return;

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      const success = await saveIdeorama(id, scene);
      if (success) {
        setSaveStatus('saved');
        savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  // Load
  useEffect(() => {
    if (!ideoramaid) return;

    isLoadingData.current = true;
    isFirstSubscribeRef.current = true;

    actions.resetScene(); //reset

    getIdeoramaById(ideoramaid)
      .then(async res => {
        const record = res.data as any;
        setIdeoramaUserId(record.userId);

        let scene: ModelsInfo | null = null;

        if (record.scene) {
          const { url } = await getSignedUrl(record.scene);
          const sceneRes = await fetch(url);
          if (!sceneRes.ok)
            throw new Error(`Failed to fetch scene: ${sceneRes.status}`);
          scene = (await sceneRes.json()) as ModelsInfo;
        }

        return { scene, record };
      })
      .then(({ scene, record }: { scene: ModelsInfo | null; record: any }) => {
        if (scene) {
          if (scene.global) Object.assign(sceneState.global, scene.global);
          if (scene.background)
            Object.assign(sceneState.background, scene.background);
          if (scene.info) Object.assign(sceneState.info, scene.info);
          if (scene.floor) Object.assign(sceneState.floor, scene.floor);
          if (scene.objects) sceneState.objects = scene.objects;
        }

        if (record.name)
          sceneState.info = { ...sceneState.info, name: record.name };
        if (typeof record.isPublic === 'boolean')
          sceneState.global = {
            ...sceneState.global,
            isPublic: record.isPublic,
          };

        actions.stackState();
        isLoadingData.current = false;
        isFirstSubscribeRef.current = false;
      })
      .catch(err => {
        console.error('[LoadIdeorama] Failed:', err);

        if (isNotFoundError(err)) {
          navigate('/not-found', {
            replace: true,
            state: {
              title: 'Idéorama introuvable',
              message: "Cet idéorama n'existe pas ou vous n'avez pas accès.",
              backTo: '/app/my-ideoramas',
              backLabel: 'Mes idéoramas',
            },
          });
        } else {
          toast.error('Erreur lors du chargement du idéorama');
        }

        isLoadingData.current = false;
        isFirstSubscribeRef.current = false;
      });
  }, [ideoramaid]);

  // Auto-save on state change
  useEffect(() => {
    const unsub = subscribe(sceneState, () => {
      if (
        isLoadingData.current ||
        isFirstSubscribeRef.current ||
        sceneState.isDragging ||
        !canEditRef.current
      )
        return;

      setSaveStatus('pending');
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(performSave, AUTOSAVE_DEBOUNCE_MS);
    });
    return unsub;
  }, [performSave]);

  // Save after drag ends
  useEffect(() => {
    const unsub = subscribeKey(sceneState, 'isDragging', isDragging => {
      if (isLoadingData.current || !canEditRef.current) return;
      if (!isDragging) {
        setSaveStatus('pending');
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          performSave();
          actions.stackState();
        }, AUTOSAVE_DEBOUNCE_MS);
      }
    });
    return unsub;
  }, [performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

      isLoadingData.current = true;
      sceneState.selectedObjectId = null;
      sceneState.history = [];
      sceneState.current = -1;
      sceneState.newest = 0;
      sceneState.mode = 'play';
    };
  }, []);

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

          {/* Top toolbar */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
            {canEdit && (
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

            {current !== 0 && isEditMode && (
              <SuperButton
                tooltip="Revenir en arrière"
                voiceText="Revenir en arrière"
                onClick={() => actions.undo()}
                className="p-2 main-small-btn"
              >
                <Undo2 className="w-4 h-4 text-white!" />
              </SuperButton>
            )}

            {current !== newest && isEditMode && (
              <SuperButton
                tooltip="Rétablir"
                voiceText="Rétablir"
                onClick={() => actions.redo()}
                className="p-2 main-small-btn"
              >
                <Redo2 className="w-4 h-4 text-white!" />
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
                    <RotateCcw className="w-4 h-4 text-white!" />
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

            {isEditMode && saveStatus !== 'idle' && (
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full
                  bg-sidebar-dark backdrop-blur transition-all duration-300
                  ${STATUS_COLOR[saveStatus]}`}
              >
                {STATUS_LABEL[saveStatus]}
              </span>
            )}
          </div>

          {/* Bottom edit actions */}
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
