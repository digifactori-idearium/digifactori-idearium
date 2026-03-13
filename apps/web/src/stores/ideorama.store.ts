import * as THREE from 'three';
import { proxy, ref } from 'valtio';

export const themesToColors = {
  customized: {
    background: '#f0d400',
    accent: '#fcca44',
  },
  white: {
    background: '#c5c3c3',
    accent: '#cfcbcc',
  },
  black: {
    background: '#313133',
    accent: '#2a2a33',
  },
  night: {
    background: '#201333',
    accent: '#7d7d7d',
  },
  'black-orange': {
    background: '#313133',
    accent: '#2a2a33',
  },
  'pink-blue': {
    background: '#f72585',
    accent: '#b70999',
  },
  'blue-yellow': {
    background: '#3d61ee',
    accent: '#3d61ee',
  },
  'yellow-gray': {
    background: '#f6b022',
    accent: '#fcca44',
  },
};

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

  updateSlice<K extends ObjectSliceKey | RootSliceKey>(
    sliceKey: K,
    values: Partial<any>,
    objectId?: string | null
  ) {
    if (objectId) {
      const obj = sceneState.objects[objectId];
      if (!obj) return;

      const target = obj[sliceKey as ObjectSliceKey];
      if (target && typeof target === 'object') {
        Object.entries(values).forEach(([key, value]) => {
          (target as any)[key] = value;
        });
      }
    } else {
      const target = (sceneState as any)[sliceKey];
      if (target && typeof target === 'object') {
        if (
          sliceKey === 'global' &&
          values.theme &&
          values.theme !== 'customized'
        ) {
          const themeData =
            themesToColors[values.theme as keyof typeof themesToColors];
          if (themeData) {
            sceneState.background.color = themeData.background;
            sceneState.background.accent = themeData.accent;
          }
        }

        const colorSlices = ['background'];
        if (colorSlices.includes(sliceKey as string) && values.color) {
          if (
            target.color !== values.color &&
            sceneState.global.theme !== 'customized'
          ) {
            sceneState.global.theme = 'customized';
          }
        }

        Object.assign(target, values);
      }
    }
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

  addObject(name: string, type?: string) {
    const id = crypto.randomUUID();

    sceneState.objects[id] = {
      info: { name: name, category: type },
      transform: {
        position: { x: 45, y: 10, z: 45 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 8,
      },
      style: { tint: '#ffffff', opacity: 1, glow: 0, threshold: 0 },
      advanced: { parent: null, physics: false, hidden: false, locked: false },
      actions: [],
    };

    sceneState.selectedObjectId = id;
  },
  removeObject: (id: string) => {
    delete sceneState.objects[id];
    if (sceneState.selectedObjectId === id) sceneState.selectedObjectId = null;
  },
  registerObject: (id: string, obj: THREE.Object3D) =>
    sceneRegistry.set(id, ref(obj)),
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
        position: {
          x: position.x,
          y: position.y,
          z: position.z,
        },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
      },

      style: {
        tint: '#ffffff',
        opacity: 1,
        glow: 0,
        threshold: 0,
      },

      advanced: {
        parent: null,
        physics: false,
        hidden: false,
        locked: false,
      },
      actions: [],
    };

    sceneState.selectedObjectId = id;
  },

  // ACTIONS NAMAGEMENT
  addAction(objectId: string, action: ActionConfig) {
    const obj = sceneState.objects[objectId];

    if (!obj) {
      console.warn(`Object ${objectId} not found`);
      return;
    }

    if (!obj.actions) obj.actions = [];

    obj.actions.push(action);
  },

  removeAction(objectId: string, actionId: string) {
    const obj = sceneState.objects[objectId];

    if (!obj || !obj.actions) return;

    obj.actions = obj.actions.filter(a => a.id !== actionId);
  },
  setSettingView: (view: 'model' | 'actions') => {
    sceneState.activeSettingView = view;
  },
  openActionPicker: (open: boolean) => {
    sceneState.actionPickerOpen = open;
  },
};
