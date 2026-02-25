import { create } from 'zustand';

interface PartSettings {
  color: string;
  hidden: boolean;
  texture: string;
}

interface RoomState {
  // Global State
  global: {
    brightness: 'bright' | 'dim' | 'dark';
    visible: boolean;
    theme: string;
  };

  // Info State
  info: {
    description: string;
  };

  // Environment Parts
  leftWall: PartSettings;
  rightWall: PartSettings;
  floor: PartSettings;

  // Actions
  update: (path: keyof Omit<RoomState, 'update'>, values: Partial<any>) => void;
}

export const useRoomStore = create<RoomState>(set => ({
  global: { brightness: 'bright', visible: true, theme: 'black-orange' },
  info: { description: 'New Room' },
  leftWall: { color: '#7d7d7d', hidden: false, texture: 'none' },
  rightWall: { color: '#7d7d7d', hidden: false, texture: 'none' },
  floor: { color: '#444444', hidden: true, texture: 'none' },

  update: (path, values) =>
    set(state => ({
      ...state,
      [path]: {
        ...(state[path as keyof RoomState] as object),
        ...values,
      },
    })),
}));
