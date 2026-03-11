import * as THREE from 'three';
import { proxy, ref } from 'valtio';

export const themesToColors = {
  customized: {
    leftWall: '#f45405',
    rightWall: '#e80606',
    floor: '#100101',
    background: '#f0d400',
    accent: '#fcca44',
  },
  white: {
    leftWall: '#747488',
    rightWall: '#747488',
    floor: '#25252f',
    background: '#c5c3c3',
    accent: '#cfcbcc',
  },
  black: {
    leftWall: '#e0e0ff',
    rightWall: '#e0e0ff',
    floor: '#9898ba',
    background: '#313133',
    accent: '#2a2a33',
  },
  night: {
    leftWall: '#c0b7bb',
    rightWall: '#c0b7bb',
    floor: '#4f4788',
    background: '#201333',
    accent: '#231437',
  },
  'black-orange': {
    leftWall: '#ffcc55',
    rightWall: '#ffcc55',
    floor: '#9898ba',
    background: '#313133',
    accent: '#2a2a33',
  },
  'pink-blue': {
    leftWall: '#3d61ee',
    rightWall: '#3d61ee',
    floor: '#dccece',
    background: '#f72585',
    accent: '#b70999',
  },
  'blue-yellow': {
    leftWall: '#ffcc55',
    rightWall: '#ffcc55',
    floor: '#3d4255',
    background: '#3d61ee',
    accent: '#3d61ee',
  },
  'yellow-gray': {
    leftWall: '#c8daee',
    rightWall: '#c8daee',
    floor: '#414e66',
    background: '#f6b022',
    accent: '#fcca44',
  },
};

const transformModes = ['translate', 'rotate', 'scale'] as const;

export const sceneState = proxy<IdeoramaState>({
  mode: 'edit' as IdeoramaMode,

  transformMode: 0,

  global: {
    brightness: 'bright' as 'bright' | 'dim' | 'dark',
    visible: true,
    music: { currentTrack: '', volume: 0.5 },
    theme: 'pink-blue' as keyof typeof themesToColors,
  },

  info: { name: 'Template', description: 'New Ideorama', category: 'none' },

  background: { color: '#f0d400', accent: '#7d7d7d' },
  leftWall: { color: '#f45405', hidden: false, texture: 'none' },
  rightWall: { color: '#e80606', hidden: false, texture: 'none' },
  floor: { color: '#100101', hidden: false, texture: 'none' },

  objects: {} as Record<string, ObjectState>,
  selectedObjectId: null as string | null,
  isDragging: false,
  assetsPanelOpen: false,
  assetsTreeOpen: false,
});

export const sceneRegistry = new Map<string, THREE.Object3D>();

export const actions = {
  // SCENE MANAGEMENT ACTIONS

  setMode(mode: IdeoramaMode) {
    sceneState.mode = mode;
  },

  getTransformMode(): TransformMode {
    return transformModes[sceneState.transformMode];
  },

  setTransformMode(mode: number) {
    sceneState.transformMode = mode;
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
            sceneState.leftWall.color = themeData.leftWall;
            sceneState.rightWall.color = themeData.rightWall;
            sceneState.floor.color = themeData.floor;
          }
        }

        const colorSlices = ['leftWall', 'rightWall', 'floor', 'background'];
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
        scale: 8,
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
    };

    sceneState.selectedObjectId = id;
  },
};
