import { UseBoundStore, StoreApi } from 'zustand';

import { useObjectStore } from './object.store';
import { useRoomStore } from './room.store';

export const storeRegistry = {
  room: useRoomStore as UseBoundStore<StoreApi<RoomState>>,
  object: useObjectStore as UseBoundStore<StoreApi<ObjectState>>,
};

export { useObjectStore, useRoomStore };
