import { create } from 'zustand';

export const useRoomStore = create<RoomState>(set => ({
  global: { brightness: 'bright', visible: true, theme: 'black-orange' },
  info: { description: 'New Room', category: 'none' },
  background: { color: '#7d7d7d', accent: '#7d7d7d' },
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
