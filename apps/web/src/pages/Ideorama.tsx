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
import {
  getEmptyIdeorama,
  saveIdeorama,
  searchIdeorama,
} from '@/services/ideorama.service';
import { actions, sceneState } from '@/stores';

const downloadAndSaveIdeorama = (setIsSaving: (arg: boolean) => void) => {
  setIsSaving(true);
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
  // toast.success("Sauvegarde de l'idéorama réussie");
  setIsSaving(false);
};

const resetIdeorama = () => {
  getEmptyIdeorama().then(res => {
    const model = res.data.model;
    sceneState.global = model.global ? model.global : sceneState.global;
    sceneState.background = model.background
      ? model.background
      : sceneState.background;
    sceneState.info = model.info ? model.info : sceneState.info;
    sceneState.floor = model.floor ? model.floor : sceneState.floor;
    sceneState.objects = model.objects ? model.objects : sceneState.objects;
    toast.success('Idéorama réinitialisé');
  });
};

export default function Ideorama() {
  const snap = useSnapshot(sceneState);

  const { ideoramaid } = useParams();

  const isEditMode = snap.mode === 'edit';
  const userId = useUser().user?.id;

  const [activeAsset, setActiveAsset] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
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
    console.log('effect');
    const handleBeforeUnload = () => {
      saveIdeorama(localStorage.getItem('sceneState'), ideoramaid, userId).then(
        () => console.log('ha ha ha ha')
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveIdeorama(localStorage.getItem('sceneState'), ideoramaid, userId).then(
        () => console.log('hi hi hi ha')
      );
      // localStorage.setItem("sceneState", `{"global":{"brightness":"bright","visible":true,"music":{"currentTrack":"","volume":0.5},"theme":"day"},"background":{"color":"#8ecae6","accent":"#8ecae6"},"info":{"name":"Template","description":"New Ideorama","category":"none"},"floor":{"color":"#53ED83","hidden":false,"texture":"none"},"objects":{}}`)
      console.log('cleanup');
    };
  }, []);

  useEffect(() => {
    if (!ideoramaid) return;

    console.log('here');
    searchIdeorama(ideoramaid).then(res => {
      console.log('in');
      localStorage.setItem('sceneState', JSON.stringify(res.data.model));
      res.data.model.info.name = res.data.name;
      const model = res.data.model;
      if (!model) return;

      if (model.global) Object.assign(sceneState.global, model.global);
      if (model.background)
        Object.assign(sceneState.background, model.background);
      if (model.info) Object.assign(sceneState.info, model.info);
      if (model.floor) Object.assign(sceneState.floor, model.floor);
      if (model.objects) sceneState.objects = model.objects;
    });
    console.log('there');
  }, [ideoramaid]);

  useEffect(() => {
    if (!isFirstRender && !snap.isDragging) {
      downloadAndSaveIdeorama(setIsSaving);
    }
  }, [snap.global, snap.background, snap.info, snap.floor, snap.objects]);

  useEffect(() => {
    if (!isFirstRender && !snap.isDragging) {
      downloadAndSaveIdeorama(setIsSaving);
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

            {!isSaving ? (
              <button
                onClick={() => downloadAndSaveIdeorama(setIsSaving)}
                className="p-2 main-small-btn"
              >
                <span className="flex items-center gap-1">
                  <ArrowDownToLine className="w-4 h-4 text-white" />
                  <span>Sauvegarder</span>
                </span>
              </button>
            ) : (
              <button className="p-2 main-small-btn">
                <span className="flex items-center gap-1">
                  <ArrowDownToLine className="w-4 h-4 text-white" />
                  <span>En train de sauvegarder</span>
                </span>
              </button>
            )}

            <button
              onClick={() => resetIdeorama()}
              className="p-2 main-small-btn"
            >
              <span className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4 text-white" />
                <span>Réinitialiser</span>
              </span>
            </button>
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
