import { Check, Music, Pause, Play } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';

import { Search } from '@/components/common/form';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSound } from '@/hooks/useSound';
import { useStorageUrl } from '@/hooks/useStorageFile';
import { isStorageKey } from '@/lib/asset';
import { cn } from '@/lib/utils';
import { sceneState } from '@/stores';

interface MusicSelectorProps {
  type?: 'global' | 'action';
  actionId?: string;
}

// State always holds the storage key (stable, never expires).
// URLs are resolved at render time via useStorageUrl.
function setGlobalTrack(key: string, current: string) {
  sceneState.global.music = {
    ...sceneState.global.music,
    currentTrack: current === key ? '' : key,
  };
}

function setActionTrack(objId: string, actionId: string, key: string) {
  const obj = sceneState.objects[objId];
  if (!obj?.actions) return;
  const action = obj.actions.find(a => a.id === actionId);
  if (!action) return;
  action.config.music = action.config.music === key ? '' : key;
}

// ─── SoundItem ────────────────────────────────────────────────────────────────
// Isolated sub-component so useStorageUrl can be called per item (no hooks in loops).

interface SoundItemProps {
  sound: MusicItem;
  isSelected: boolean;
  isPreviewing: boolean;
  onPreview: (resolvedUrl: string) => void;
  onStopPreview: () => void;
  onSelect: (key: string) => void;
}

function SoundItem({
  sound,
  isSelected,
  isPreviewing,
  onPreview,
  onStopPreview,
  onSelect,
}: SoundItemProps) {
  const fileKey = isStorageKey(sound.file) ? sound.file : null;
  const { url, loading } = useStorageUrl(fileKey);

  // For absolute URLs (external assets), use directly.
  const resolvedUrl = fileKey ? url : sound.file;

  const name = ((sound.frName || sound.name) ?? 'Unknown')
    .replace(/\.[^/.]+$/, '')
    .slice(0, 20);

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border transition-all duration-200',
        isSelected
          ? 'border-mauve bg-mauve/5 dark:bg-mauve/10 shadow-sm'
          : 'border-border bg-card hover:bg-accent/50'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'p-2 rounded-md transition-colors',
            isSelected
              ? 'bg-mauve text-white'
              : 'bg-secondary text-muted-foreground'
          )}
        >
          <Music size={18} />
        </div>
        <span
          className={cn(
            'text-sm font-medium transition-colors',
            isSelected ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          className="h-8 w-8 rounded-full bg-mauve! text-white!"
          disabled={loading || !resolvedUrl}
          onClick={() => {
            if (!resolvedUrl) return;
            if (isPreviewing) {
              onStopPreview();
            } else {
              onPreview(resolvedUrl);
            }
          }}
        >
          {isPreviewing ? <Pause size={14} /> : <Play size={14} />}
        </Button>

        <Button
          variant={isSelected ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(sound.file)} // always pass the key
          className={cn(
            'group min-w-22.5 transition-all bg-mauve! text-white!',
            isSelected && [
              'bg-mauve text-white hover:bg-destructive! hover:border-destructive!',
              'dark:hover:bg-destructive/20! dark:hover:text-destructive!',
            ]
          )}
        >
          {isSelected ? (
            <>
              <div className="flex items-center group-hover:hidden">
                <Check size={14} className="mr-1" />
                <span>Active</span>
              </div>
              <span className="hidden group-hover:inline text-xs">Retirer</span>
            </>
          ) : (
            'Choisir'
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── MusicSelector ────────────────────────────────────────────────────────────

export function MusicSelector({
  type = 'global',
  actionId,
}: MusicSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { sounds, loading, fetchNextPage, hasMore } = useSound(searchQuery);

  const snap = useSnapshot(sceneState);
  const globalTrack = snap.global.music.currentTrack;
  const selectedObjectId = snap.selectedObjectId;
  const selectedObject = selectedObjectId
    ? snap.objects[selectedObjectId]
    : null;

  // previewId holds the sound id currently playing, not a URL.
  const [previewId, setPreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const actionTrack = useMemo(() => {
    if (type !== 'action' || !actionId || !selectedObject?.actions) return '';
    const action = selectedObject.actions.find(a => a.id === actionId);
    return action?.config?.music || '';
  }, [type, actionId, selectedObject]);

  const selectedKey = type === 'global' ? globalTrack : actionTrack;

  const handlePreview = useCallback((soundId: string, resolvedUrl: string) => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = resolvedUrl;
    audioRef.current.play();
    setPreviewId(soundId);
  }, []);

  const handleStopPreview = useCallback(() => {
    audioRef.current?.pause();
    setPreviewId(null);
  }, []);

  const selectTrack = useCallback(
    (key: string) => {
      if (type === 'global') {
        setGlobalTrack(key, globalTrack);
        return;
      }
      if (!selectedObjectId || !actionId) return;
      setActionTrack(selectedObjectId, actionId, key);
    },
    [type, globalTrack, selectedObjectId, actionId]
  );

  const handleAsyncSearch = useCallback(
    async (query: string): Promise<SearchOption[]> => {
      setSearchQuery(query);
      return sounds.map(sound => ({
        label: sound.frName || sound.name,
        value: sound.file,
      }));
    },
    [sounds]
  );

  return (
    <div className="flex flex-col gap-3">
      <Search
        label="son"
        placeholder="Chercher un son, une musique..."
        onSearch={handleAsyncSearch}
        onSelect={() => {}}
      />

      <ScrollArea
        className="h-72 pr-4"
        onScrollCapture={e => {
          const el = e.currentTarget;
          const nearBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
          if (nearBottom && hasMore && !loading) fetchNextPage();
        }}
      >
        <div className="flex flex-col gap-2">
          {sounds.map(sound => (
            <SoundItem
              key={sound.id}
              sound={sound}
              isSelected={selectedKey === sound.file}
              isPreviewing={previewId === String(sound.id)}
              onPreview={resolvedUrl =>
                handlePreview(String(sound.id), resolvedUrl)
              }
              onStopPreview={handleStopPreview}
              onSelect={selectTrack}
            />
          ))}

          {loading && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          )}
          {!hasMore && sounds.length === 0 && !loading && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Aucun son trouvé.
            </div>
          )}
        </div>
      </ScrollArea>

      <audio ref={audioRef} onEnded={() => setPreviewId(null)} hidden />
    </div>
  );
}
