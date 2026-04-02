import { Music, Play, Pause, Check } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';
import { useSnapshot } from 'valtio';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { sceneState } from '@/stores';

const TRACKS = [
  { id: 'sea', name: 'Deep Sea', url: '/sea.wav' },
  { id: 'forest', name: 'Forest Rain', url: '/forest.wav' },
  { id: 'gun', name: 'Action Beats', url: '/son.mp3' },
];

interface MusicSelectorProps {
  type?: 'global' | 'action';
}

export function MusicSelector({ type = 'global' }: MusicSelectorProps) {
  const snap = useSnapshot(sceneState);
  const globalTrack = snap.global.music.currentTrack;
  const selectObjectIp = snap.selectedObjectId;
  const trigger = snap.pendingTrigger;
  const selectedObject = selectObjectIp ? snap.objects[selectObjectIp] : null;
  const actionTrack = useMemo(() => {
    if (type !== 'action' || !selectedObject?.actions) return '';

    const action = selectedObject.actions.find(
      a => a.subType === 'playSound' && a.trigger === trigger
    );
    return action?.config?.music ?? '';
  }, [type, selectedObject, trigger]);

  const [previewId, setPreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedUrl = type === 'global' ? globalTrack : actionTrack;

  const togglePreview = (track: (typeof TRACKS)[0]) => {
    if (previewId === track.id) {
      audioRef.current?.pause();
      setPreviewId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = track.url;
        audioRef.current.play();
      }
      setPreviewId(track.id);
    }
  };
  const selectTrack = (url: string) => {
    if (type === 'global') {
      sceneState.global.music.currentTrack = globalTrack === url ? '' : url;
      return;
    }
    const objId = snap.selectedObjectId;
    const currentTrigger = snap.pendingTrigger;

    if (!objId || !currentTrigger) return;
    const actions = sceneState.objects[objId].actions;
    const targetAction = (actions || []).find(
      a => a.subType === 'playSound' && a.trigger === currentTrigger
    );

    if (targetAction) {
      targetAction.config.music = targetAction.config.music === url ? '' : url;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ScrollArea className="h-72 pr-4">
        <div className="flex flex-col gap-2">
          {TRACKS.map(track => {
            const isSelected = selectedUrl === track.url;

            return (
              <div
                key={track.id}
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
                    {track.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full bg-mauve! text-white!"
                    onClick={() => togglePreview(track)}
                  >
                    {previewId === track.id ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} />
                    )}
                  </Button>

                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => selectTrack(track.url)}
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
        </div>
      </ScrollArea>
      <audio ref={audioRef} onEnded={() => setPreviewId(null)} hidden />
    </div>
  );
}
