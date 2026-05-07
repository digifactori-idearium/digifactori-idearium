import { toast } from 'sonner';
import * as THREE from 'three';
import { proxy } from 'valtio';

import { resetState, stackNewState } from '@/lib/state';
import { themesToColors } from '@/lib/theme';
import { round } from '@/lib/utils';
import { getEmptyIdeorama } from '@/services/ideorama.service';
// infered types

//theme
const INITIAL_THEME = 'day' as keyof typeof themesToColors;
const initialThemeData = themesToColors[INITIAL_THEME];

//action
const NON_DUPLICABLE_ACTIONS = ['playSound', 'say'];

export const sceneState = proxy<IdeoramaState>({
  // Global State
  id: '',
  mode: 'play' as IdeoramaMode,
  global: {
    brightness: 'bright' as 'bright' | 'dim' | 'dark',
    isPublic: true,
    music: { currentTrack: '', volume: 0.5 },
    theme: INITIAL_THEME,
  },
  background: {
    color: initialThemeData.background,
    accent: initialThemeData.accent,
  },

  // Info State
  info: { name: 'New Ideorama', category: 'none' },
  floor: { color: initialThemeData.floor, hidden: false, texture: 'none' },

  //setting
  settingPanelOpen: false,

  // Objects managements
  objects: {} as Record<string, ObjectState>,
  selectedObjectId: null as string | null,

  //Objects movement management
  isDragging: false,
  assetsPanelOpen: false,
  assetsTreeOpen: false,

  //Action management
  activeSettingView: 'model',
  actionPickerOpen: false,

  // undo/redo management
  history: [],
  current: -1,
  newest: 0,

  pendingTrigger: 'onStart' as TriggerType,
});

export const sceneRegistry = new Map<string, THREE.Object3D>();

export const actions = {
  // SCENE MANAGEMENT ACTIONS
  setMode(mode: IdeoramaMode) {
    sceneState.mode = mode;
  },

  // (Private) applay theme management
  applyThemeSideEffects(theme: string) {
    if (theme === 'customized') return;
    const themeData = themesToColors[theme as keyof typeof themesToColors];
    if (!themeData) return;
    sceneState.background.color = themeData.background;
    sceneState.background.accent = themeData.accent;
    sceneState.floor.color = themeData.floor;
  },

  markThemeCustomized(
    sliceKey: string,
    values: Partial<{ color: string }>,
    target: Record<string, unknown>
  ) {
    const colorSlices = ['background', 'floor'];
    if (!colorSlices.includes(sliceKey)) return;
    if (!values.color) return;
    if (
      target.color !== values.color &&
      sceneState.global.theme !== 'customized'
    ) {
      sceneState.global.theme = 'customized';
    }
  },

  // Update Store
  updateSlice<K extends ObjectSliceKey | RootSliceKey>(
    sliceKey: K,
    values: Partial<any>,
    objectId?: string | null
  ) {
    if (objectId) {
      const obj = sceneState.objects[objectId];
      if (!obj) return;

      const target = obj[sliceKey as ObjectSliceKey];
      if (!target || typeof target !== 'object') return;

      Object.assign(target, values);
      return;
    }

    const target = (sceneState as any)[sliceKey];
    if (!target || typeof target !== 'object') return;

    if (sliceKey === 'global' && values.theme)
      this.applyThemeSideEffects(values.theme);
    this.markThemeCustomized(sliceKey as string, values, target);

    Object.assign(target, values);
  },

  // Model/Object MANAGEMENT ACTIONS
  setIsDragging(value: boolean) {
    sceneState.isDragging = value;
  },

  selectObject: (id: string | null) => {
    sceneState.selectedObjectId = id;
  },

  clearSelection() {
    sceneState.selectedObjectId = null;
  },

  removeObject: (id: string) => {
    delete sceneState.objects[id];
    if (sceneState.selectedObjectId === id) sceneState.selectedObjectId = null;
    stackNewState(sceneState);
  },
  registerObject: (id: string, obj: THREE.Object3D) =>
    sceneRegistry.set(id, obj),

  unregisterObject: (id: string) => sceneRegistry.delete(id),

  // Setting Management
  toggleSettingPanel(open?: boolean) {
    if (open !== undefined) {
      sceneState.settingPanelOpen = open;
    } else {
      sceneState.settingPanelOpen = !sceneState.settingPanelOpen;
    }
  },

  async resetIdeorama() {
    try {
      await getEmptyIdeorama().then(res => {
        const model = res.data;
        sceneState.global = model.global ? model.global : sceneState.global;
        sceneState.background = model.background
          ? model.background
          : sceneState.background;
        sceneState.info = model.info ? model.info : sceneState.info;
        sceneState.floor = model.floor ? model.floor : sceneState.floor;
        sceneState.objects = model.objects ? model.objects : sceneState.objects;
        stackNewState(sceneState);
      });
      return true;
    } catch (error) {
      console.error('resetIdeorama error:', error);
      return false;
    }
  },

  // ASSETS MANAGEMENT ACTIONS
  toggleAssetsPanel(open?: boolean) {
    if (open !== undefined) {
      sceneState.assetsPanelOpen = open;
    } else {
      sceneState.assetsPanelOpen = !sceneState.assetsPanelOpen;
    }
  },

  toggleAssetsTree(open?: boolean) {
    if (open !== undefined) {
      sceneState.assetsTreeOpen = open;
    } else {
      sceneState.assetsTreeOpen = !sceneState.assetsTreeOpen;
    }
  },

  copyObject(object: ObjectState) {
    const id = crypto.randomUUID();

    const OFFSET = 2;

    sceneState.objects[id] = {
      info: { ...object.info },
      transform: {
        position: {
          x: object.transform.position.x + OFFSET,
          y: object.transform.position.y,
          z: object.transform.position.z + OFFSET,
        },
        rotation: { ...object.transform.rotation },
        scale: object.transform.scale,
      },
      style: { ...object.style },
      advanced: { ...object.advanced },
      actions: object.actions?.map(action => ({ ...action })) ?? [],
      actionsVersion: 0,
    };

    sceneState.selectedObjectId = id;
  },

  spawnAssetAtPosition(asset: AssetItem, position: THREE.Vector3) {
    const id = crypto.randomUUID();
    sceneState.objects[id] = {
      info: {
        name: asset.name,
        category: asset.category,
        file: asset.file,
        preview: asset.thumbnail,
      },
      transform: {
        position: {
          x: round(position.x),
          y: round(position.y),
          z: round(position.z),
        },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
      },
      style: { tint: '#ffffff', opacity: 1, glow: 0, threshold: 0 },
      advanced: { parent: null, physics: false, hidden: false, locked: false },
      actions: [],
      actionsVersion: 0,
    };

    sceneState.selectedObjectId = id;

    stackNewState(sceneState);
  },

  // Historic management
  stackState() {
    stackNewState(sceneState);
  },

  // Undo/ redo
  undo() {
    if (sceneState.current <= 0) return;
    sceneState.current -= 1;
    sceneState.selectedObjectId = null;
    resetState(sceneState);
  },
  redo() {
    if (sceneState.current >= sceneState.newest) return;
    sceneState.current += 1;
    resetState(sceneState);
  },
  // ACTIONS MANAGEMENT
  addAction(objectId: string, action: ActionConfig) {
    const obj = sceneState.objects[objectId];
    if (!obj) return;

    obj.actions ??= [];

    const alreadyExists = obj.actions.some(
      a =>
        a.subType === action.subType &&
        a.trigger === action.trigger &&
        NON_DUPLICABLE_ACTIONS.includes(action.subType)
    );

    if (alreadyExists) {
      toast.error("C'est déjà là !");
      return;
    }

    obj.actions.push(action);
    obj.actionsVersion = (obj.actionsVersion ?? 0) + 1;
  },

  removeAction(objectId: string, actionId: string) {
    const obj = sceneState.objects[objectId];
    if (!obj?.actions) return;
    obj.actions = obj.actions.filter(a => a.id !== actionId);
    obj.actionsVersion = (obj.actionsVersion ?? 0) + 1;
  },

  reorderAction(objectId: string, actionId: string, direction: 'up' | 'down') {
    const obj = sceneState.objects[objectId];
    if (!obj?.actions) return;

    const index = obj.actions.findIndex(a => a.id === actionId);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= obj.actions.length) return;

    [obj.actions[index], obj.actions[swapIndex]] = [
      obj.actions[swapIndex],
      obj.actions[index],
    ];
  },

  bumpActionsVersion(objectId: string) {
    const obj = sceneState.objects[objectId];
    if (!obj) return;
    obj.actionsVersion = (obj.actionsVersion ?? 0) + 1;
  },

  // Views
  setSettingView: (view: 'model' | 'actions') => {
    sceneState.activeSettingView = view;
  },
  openActionPicker: (open: boolean) => {
    sceneState.actionPickerOpen = open;
  },
};

if (import.meta.hot) {
  import.meta.hot.dispose(data => {
    try {
      data.sceneState = {
        global: JSON.parse(JSON.stringify(sceneState.global)),
        background: JSON.parse(JSON.stringify(sceneState.background)),
        info: JSON.parse(JSON.stringify(sceneState.info)),
        floor: JSON.parse(JSON.stringify(sceneState.floor)),
        objects: JSON.parse(JSON.stringify(sceneState.objects)),
        selectedObjectId: sceneState.selectedObjectId,
      };
    } catch (err) {
      console.error('HMR dispose: failed to serialize sceneState', err);
    }
  });

  if (import.meta.hot.data.sceneState) {
    const saved = import.meta.hot.data.sceneState;
    if (saved.global) Object.assign(sceneState.global, saved.global);
    if (saved.background)
      Object.assign(sceneState.background, saved.background);
    if (saved.info) Object.assign(sceneState.info, saved.info);
    if (saved.floor) Object.assign(sceneState.floor, saved.floor);
    if (saved.objects) sceneState.objects = saved.objects;
    if (saved.selectedObjectId !== undefined) {
      sceneState.selectedObjectId = saved.selectedObjectId;
    }
  }
}
