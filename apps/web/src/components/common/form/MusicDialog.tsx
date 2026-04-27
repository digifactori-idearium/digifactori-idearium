import { Check, Music, Pause, Play } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';

import { Search } from '@/components/common/form';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/utils';
import { sceneState } from '@/stores';

interface MusicSelectorProps {
  type?: 'global' | 'action';
  actionId?: string;
}

function setGlobalTrack(url: string, current: string) {
  sceneState.global.music = {
    ...sceneState.global.music,
    currentTrack: current === url ? '' : url,
  };
}

function setActionTrack(objId: string, actionId: string, url: string) {
  const obj = sceneState.objects[objId];
  if (!obj?.actions) return;

  const action = obj.actions.find(a => a.id === actionId);
  if (!action) return;

  action.config.music = action.config.music === url ? '' : url;
}

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

  const [previewId, setPreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const actionTrack = useMemo(() => {
    if (type !== 'action' || !actionId || !selectedObject?.actions) return '';
    const action = selectedObject.actions.find(a => a.id === actionId);
    return action?.config?.music || '';
  }, [type, actionId, selectedObject]);

  const selectedUrl = type === 'global' ? globalTrack : actionTrack;

  const togglePreview = useCallback(
    (sound: MusicItem) => {
      if (!audioRef.current) return;
      if (previewId === String(sound.id)) {
        audioRef.current.pause();
        setPreviewId(null);
      } else {
        audioRef.current.pause();
        audioRef.current.src = sound.file;
        audioRef.current.play();
        setPreviewId(String(sound.id));
      }
    },
    [previewId]
  );

  const selectTrack = useCallback(
    (url: string) => {
      if (type === 'global') {
        setGlobalTrack(url, globalTrack);
        return;
      }
      if (!selectedObjectId || !actionId) return;
      setActionTrack(selectedObjectId, actionId, url);
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

  const getSoundName = (sound: MusicItem) => {
    return ((sound.frName || sound.name) ?? 'Unknown')
      .replace(/\.[^/.]+$/, '')
      .slice(0, 20);
  };

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
          {sounds.map((sound, id) => {
            const isSelected = selectedUrl === sound.file;
            return (
              <div
                key={id}
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
                    {getSoundName(sound)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full bg-mauve! text-white!"
                    onClick={() => togglePreview(sound)}
                  >
                    {previewId === String(sound.id) ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} />
                    )}
                  </Button>

                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => selectTrack(sound.file)}
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
                        <span className="hidden group-hover:inline text-xs">
                          Retirer
                        </span>
                      </>
                    ) : (
                      'Choisir'
                    )}
                  </Button>
                </div>
              </div>
            );
          })}

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
