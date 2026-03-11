import { Search, X } from 'lucide-react';
import { useSnapshot } from 'valtio';

import { AssetsGrid } from '../assets/AssetsGrid';

import { sceneState, actions } from '@/stores';

export const AssetsPanel = () => {
  const snap = useSnapshot(sceneState);

  if (!snap.assetsPanelOpen) return null;

  return (
    <div className="absolute left-4 bottom-5 w-[320px] h-145 z-60 animate-in slide-in-from-bottom-10">
      <div className="flex flex-col h-full backdrop-blur-xl bg-neutral-600/5 border border-white/20 rounded-2xl shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
          <h2 className="font-semibold text-lg">Thing Library</h2>

          <div className="flex items-center gap-2">
            <Search className="size-5 cursor-pointer" />

            <button
              onClick={() => actions.toggleAssetsPanel(false)}
              className="hover:bg-white/10 p-1! bg-transparent! rounded border border-white/20!"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-4">
          <AssetsGrid />
        </div>
      </div>
    </div>
  );
};
