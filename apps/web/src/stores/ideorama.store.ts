import * as THREE from 'three';
import { proxy } from 'valtio';

import { themesToColors } from '@/lib/theme';

const INITIAL_THEME = 'night' as keyof typeof themesToColors;

const initialThemeData = themesToColors[INITIAL_THEME];

export const sceneState = proxy<IdeoramaState>({
  // Global State
  id: '',
  mode: 'edit' as IdeoramaMode,
  global: {
    brightness: 'bright' as 'bright' | 'dim' | 'dark',
    visible: true,
    music: { currentTrack: '', volume: 0.5 },
    theme: INITIAL_THEME,
  },
  background: {
    color: initialThemeData.background,
    accent: initialThemeData.accent,
  },

  // Info State
  info: { name: 'Template', description: 'New Ideorama', category: 'none' },
  floor: { color: initialThemeData.floor, hidden: false, texture: 'none' },

  //setting
  settingPanelOpen: false,

  // Objects managements
  objects: {} as Record<string, ObjectState>,
  selectedObjectId: null as string | null,

  //Objects movement managemet
  isDragging: false,
  assetsPanelOpen: false,
  assetsTreeOpen: false,

  //Action management
  activeSettingView: 'model',
  actionPickerOpen: false,
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

  markThemeCustomized(sliceKey: string, values: Partial<any>, target: any) {
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
  },
  registerObject: (id: string, obj: THREE.Object3D) =>
    sceneRegistry.set(id, obj),

  unregisterObject: (id: string) => sceneRegistry.delete(id),

  // Setting Mangament
  toggleSettingPanel(open?: boolean) {
    if (open !== undefined) {
      sceneState.settingPanelOpen = open;
    } else {
      sceneState.settingPanelOpen = !sceneState.settingPanelOpen;
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

  spawnAssetAtPosition(asset: AssetItem, position: THREE.Vector3) {
    const id = crypto.randomUUID();

    sceneState.objects[id] = {
      info: {
        name: asset.name,
        category: asset.category,
        file: asset.file,
      },
      transform: {
        position: { x: position.x, y: position.y, z: position.z },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
      },
      style: { tint: '#ffffff', opacity: 1, glow: 0, threshold: 0 },
      advanced: { parent: null, physics: false, hidden: false, locked: false },
      actions: [],
    };

    sceneState.selectedObjectId = id;
  },
  // ACTIONS NAMAGEMENT
  addAction(objectId: string, action: ActionConfig) {
    const obj = sceneState.objects[objectId];
    if (!obj) return;
    (obj.actions ??= []).push(action);
  },

  removeAction(objectId: string, actionId: string) {
    const obj = sceneState.objects[objectId];
    if (!obj?.actions) return;

    const idx = obj.actions.findIndex(a => a.id === actionId);
    if (idx !== -1) obj.actions.splice(idx, 1);
  },

  // Views
  setSettingView: (view: 'model' | 'actions') => {
    sceneState.activeSettingView = view;
  },
  openActionPicker: (open: boolean) => {
    sceneState.actionPickerOpen = open;
  },
};
