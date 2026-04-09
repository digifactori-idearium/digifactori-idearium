import { Music, Play, Pause, Check, Search, X } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';
import { useSnapshot } from 'valtio';

// import { Search } from '@/components/global/Search';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/utils';
import { sceneState } from '@/stores';

interface MusicSelectorProps {
  type?: 'global' | 'action';
}

function setGlobalTrack(url: string, current: string) {
  sceneState.global.music.currentTrack = current === url ? '' : url;
}

function setActionTrack(objId: string, trigger: string, url: string) {
  const actions = sceneState.objects[objId].actions;
  const targetAction = (actions || []).find(
    a => a.subType === 'playSound' && a.trigger === trigger
  );
  if (targetAction) {
    targetAction.config.music = targetAction.config.music === url ? '' : url;
  }
}

export function MusicSelector({ type = 'global' }: MusicSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { sounds, loading, fetchNextPage, hasMore } = useSound(searchQuery);

  const snap = useSnapshot(sceneState);
  const globalTrack = snap.global.music.currentTrack;
  const selectedObjectId = snap.selectedObjectId;
  const trigger = snap.pendingTrigger;
  const selectedObject = selectedObjectId
    ? snap.objects[selectedObjectId]
    : null;

  // console.log(sounds);

  const [previewId, setPreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const actionTrack = useMemo(() => {
    if (type !== 'action' || !selectedObject?.actions) return '';
    const action = selectedObject.actions.find(
      a => a.subType === 'playSound' && a.trigger === trigger
    );
    return action?.config?.music ?? '';
  }, [type, selectedObject, trigger]);

  const selectedUrl = type === 'global' ? globalTrack : actionTrack;

  const searchOptions = sounds.map(s => ({
    value: String(s.id),
    label: s.name,
  }));

  const togglePreview = (sound: AssetItem) => {
    if (previewId === String(sound.id)) {
      audioRef.current?.pause();
      setPreviewId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = sound.file;
        audioRef.current.play();
      }
      setPreviewId(String(sound.id));
    }
  };

  const selectTrack = (url: string) => {
    if (type === 'global') {
      setGlobalTrack(url, globalTrack);
      return;
    }
    const objId = sceneState.selectedObjectId;
    const currentTrigger = sceneState.pendingTrigger;
    if (!objId || !currentTrigger) return;
    setActionTrack(objId, currentTrigger, url);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`w-4/5 flex items-center self-center gap-2 bg-neutral-900/80 backdrop-blur-md rounded-md px-2 py-2 transition-all duration-300 ${'opacity-100 scale-100'}`}
      >
        <Search className="size-5 cursor-pointer" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Chercher un son, une musique..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/50 py-1"
        />

        <button
          onClick={() => {
            setSearchQuery('');
          }}
        >
          <X className="size-4 text-white/70 mr-2" />
        </button>
      </div>
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
          {sounds.map(sound => {
            const isSelected = selectedUrl === sound.file;

            return (
              <div
                key={sound.id}
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
                    {sound.frName || sound.name}
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
