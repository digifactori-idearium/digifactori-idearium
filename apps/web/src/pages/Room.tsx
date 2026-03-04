import { CirclePlay, Plus, SquarePen } from 'lucide-react';
import { useSnapshot } from 'valtio';

import Scene from '@/components/3d';
import { ConfigPanel } from '@/components/panel/ConfigPanel';
import { ObjectListPanel } from '@/components/panel/ObjectListPanel';
import { ObjectConfigPanel } from '@/components/panel/ObjectPanel';
import { sceneState, actions } from '@/stores';

export default function Room() {
  const snap = useSnapshot(sceneState);

  const isEditMode = snap.mode === 'edit';
  const selectedObject = snap.selectedObjectId;

  return (
    <div className="flex lg:h-full lg:flex-row flex-col w-full overflow-hidden relative">
      <div className="w-full h-full overflow-hidden flex flex-col">
        <Scene />

        <button
          onClick={() => actions.setMode(isEditMode ? 'play' : 'edit')}
          className="absolute top-3 left-[calc(50%-100px)] z-50 p-2! main-small-btn"
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

        <button
          onClick={() => actions.addObject('table')}
          className="absolute top-3 left-1/2 z-50 p-2! main-small-btn"
        >
          <span className="flex items-center gap-1">
            <Plus className="w-4 h-4 text-white!" />
            <span>Add object</span>
          </span>
        </button>
      </div>

      {isEditMode && (
        <aside className="fixed right-3 top-20 bottom-3 w-80 z-50 animate-in slide-in-from-right duration-500">
          <div className="h-full w-full flex flex-col backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden text-white">
            {selectedObject ? <ObjectConfigPanel /> : <ConfigPanel />}
          </div>
        </aside>
      )}
      {isEditMode && (
        <aside className="fixed left-3 top-20 bottom-3 w-64 z-50 animate-in slide-in-from-left duration-500">
          <ObjectListPanel />
        </aside>
      )}
    </div>
  );
}
