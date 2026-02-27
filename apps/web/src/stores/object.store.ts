import { create } from 'zustand';

export const useObjectStore = create<ObjectState>(set => ({
  info: {
    name: 'New Object',
  },

  transform: {
    position: { x: 0, y: 0, z: 0 },
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

  update: (path, values) =>
    set(state => ({
      ...state,
      [path]: {
        ...(state[path as keyof ObjectState] as object),
        ...values,
      },
    })),
}));
