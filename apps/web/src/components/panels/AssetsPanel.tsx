import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useSnapshot } from 'valtio';

import { AssetsGrid } from '@/components/assets/AssetsGrid';
import { SuperButton } from '@/components/common/button';
import { sceneState, actions } from '@/stores';

export const AssetsPanel = () => {
  const snap = useSnapshot(sceneState);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');

  const handleSearch = () => {
    setCommittedQuery(searchQuery.trim().toLowerCase());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') handleCloseSearch();
  };

  const handleCloseSearch = () => {
    setSearchQuery('');
    setCommittedQuery('');
    setSearchOpen(false);
  };

  if (!snap.assetsPanelOpen) return null;

  return (
    <div className="absolute left-4 bottom-5 w-[320px] h-145 z-60 animate-in slide-in-from-left duration-500">
      <div className="flex flex-col h-full backdrop-blur-xl bg-neutral-600/5 border border-white/20 rounded-2xl shadow-2xl text-white overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/20 min-h-13">
          {searchOpen ? (
            <>
              <div className="flex flex-1 items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5 min-w-0">
                <Search className="size-4 text-white/50 shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search, then press Enter…"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40 min-w-0"
                />
                {searchQuery.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCommittedQuery('');
                    }}
                    className="text-white/40 hover:text-white transition-colors shrink-0"
                    aria-label="Clear"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Go button */}
              <button
                onClick={handleSearch}
                className="shrink-0 flex items-center gap-1 bg-blue-500 hover:bg-blue-400 active:scale-95 transition-all text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                <Search className="size-3.5" />
                Go!
              </button>

              {/* Close search */}
              <SuperButton
                variant={'ghost'}
                tooltip="Fermer la recherche"
                onClick={handleCloseSearch}
                className="shrink-0 p-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                aria-label="Close search"
              >
                <X className="size-4 text-white/70" />
              </SuperButton>
            </>
          ) : (
            /* Default Headers*/
            <>
              <h2 className="flex-1 font-semibold text-lg">
                Collection d'objets
              </h2>

              <SuperButton
                variant={'ghost'}
                tooltip="Rechercher un objet"
                onClick={() => setSearchOpen(true)}
                className="p-1! bg-transparent hover:bg-white/10 rounded border border-white/20!"
              >
                <Search className="size-5 text-white" />
              </SuperButton>

              <SuperButton
                variant={'ghost'}
                tooltip="Fermer"
                onClick={() => actions.toggleAssetsPanel(false)}
                className=" p-1! bg-transparent hover:bg-white/10  rounded border border-white/20!"
              >
                <X className="size-5 text-white" />
              </SuperButton>
            </>
          )}
        </div>

        {/* Active search badge */}
        {committedQuery && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border-b border-blue-400/20 text-xs text-blue-300">
            <Search className="size-3.5 shrink-0" />
            <span className="truncate">
              Résultats pour : <strong>"{committedQuery}"</strong>
            </span>
            <button
              onClick={() => {
                setCommittedQuery('');
                setSearchQuery('');
              }}
              className="ml-auto shrink-0 hover:text-white transition-colors"
              aria-label="Clear results"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-4">
          <AssetsGrid query={committedQuery} />
        </div>
      </div>
    </div>
  );
};
