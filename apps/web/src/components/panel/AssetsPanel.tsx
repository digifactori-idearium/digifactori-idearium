import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';

import { AssetsGrid } from '../assets/AssetsGrid';
import { SuperButton } from '../global';

import { sceneState, actions } from '@/stores';

export const AssetsPanel = () => {
  const snap = useSnapshot(sceneState);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!snap.assetsPanelOpen) return null;

  return (
    <div className="absolute left-4 bottom-5 w-[320px] h-145 z-60 animate-in slide-in-from-left duration-500">
      <div className="flex flex-col h-full backdrop-blur-xl bg-neutral-600/5 border border-white/20 rounded-2xl shadow-2xl text-white overflow-hidden">
        {/* HEADER */}
        <div className="relative flex items-center justify-between px-4 py-3 border-b border-white/20">
          {/* Title */}
          <h2
            className={`font-semibold text-lg transition-opacity duration-200 ${
              searchOpen ? 'opacity-0' : 'opacity-100'
            }`}
          >
            Thing Library
          </h2>

          {/* Right Icons */}
          <div className="flex items-center gap-2 z-10">
            <SuperButton
              tooltip="Rechercher un objet"
              onClick={() => setSearchOpen(true)}
              className={`hover:bg-white/10 p-1! bg-transparent! rounded ${!searchOpen ? 'border' : ''} border-white/20!`}
            >
              <Search className="size-5 cursor-pointer text-white" />
            </SuperButton>

            <SuperButton
              tooltip="Fermer"
              onClick={() => actions.toggleAssetsPanel(false)}
              className="hover:bg-white/10 p-1! bg-transparent! rounded border border-white/20!"
            >
              <X className="size-5 text-white" />
            </SuperButton>
          </div>

          {/* Animated Search Bar */}
          <div
            className={`absolute left-4 right-12 flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md rounded-md px-2 transition-all duration-300 ${
              searchOpen
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <input
              autoFocus={searchOpen}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/50 py-1"
            />

            <SuperButton
              onClick={() => {
                setSearchQuery('');
                setSearchOpen(false);
              }}
              tooltip="ferme la recherche"
              className="group bg-transparent! hover:text-red-500!"
            >
              <X className="size-4 text-white/70 transition-colors group-hover:text-red-500! mr-5" />
            </SuperButton>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-4">
          <AssetsGrid query={debouncedQuery} />
        </div>
      </div>
    </div>
  );
};
