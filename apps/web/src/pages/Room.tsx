import { CirclePlay, SquarePen } from 'lucide-react';

import EmptyRoom from './EmptyRoom';

import { ConfigPanel } from '@/components/panel/ConfigPanel';
import { ObjectConfigPanel } from '@/components/panel/ObjectPanel';
import { useRoomStore } from '@/stores';

export default function Room() {
  const mode = useRoomStore(state => state.mode);
  const setMode = useRoomStore(state => state.setMode);

  const selectedObject = false;

  const isEditMode = mode === 'edit';

  return (
    <div className="flex lg:h-full lg:flex-row flex-col w-full overflow-hidden relative">
      <div className="w-full h-full overflow-hidden flex flex-col">
        <EmptyRoom />

        <button
          onClick={() => setMode(isEditMode ? 'play' : 'edit')}
          className="absolute top-3 left-3 z-50 p-2! main-small-btn"
        >
          {isEditMode ? (
            <span className="flex items-center gap-1">
              <CirclePlay className="w-4 h-4 text-white!" />
              <span>Jouer</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <SquarePen className="w-4 h-4 text-white!" />
              <span>Modifier</span>
            </span>
          )}
        </button>
      </div>

      {/* FLOATING RIGHT CONFIG PANEL */}
      {isEditMode && (
        <aside className="fixed right-3 top-20 bottom-3 w-80 z-50 animate-in slide-in-from-right duration-500">
          <div className="h-full w-full flex flex-col backdrop-blur-xl border  rounded-xl shadow-2xl overflow-hidden text-white">
            {selectedObject ? <ObjectConfigPanel /> : <ConfigPanel />}
          </div>
        </aside>
      )}
    </div>
  );
}
