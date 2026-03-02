import { Music, Play, Pause, Check } from 'lucide-react';
import { useState, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useRoomStore } from '@/stores';

const TRACKS = [
  { id: 'sea', name: 'Deep Sea', url: '/sea.wav' },
  { id: 'forest', name: 'Forest Rain', url: '/forest.wav' },
  { id: 'gun', name: 'Action Beats', url: '/son.mp3' },
];

export function MusicSelector() {
  const currentTrack = useRoomStore(state => state.global.music.currentTrack);
  const update = useRoomStore(state => state.update);

  const [previewId, setPreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePreview = (track: (typeof TRACKS)[0]) => {
    if (previewId === track.id) {
      audioRef.current?.pause();
      setPreviewId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play();
      }
      setPreviewId(track.id);
    }
  };

  const selectTrack = (url: string) => {
    const currentMusicState = useRoomStore.getState().global.music;
    const newTrack = currentTrack === url ? '' : url;

    update('global', {
      music: { ...currentMusicState, currentTrack: newTrack },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <ScrollArea className="h-72 pr-4">
        <div className="flex flex-col gap-2">
          {TRACKS.map(track => {
            const isSelected = currentTrack === track.url;

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
                      'group min-w-22.5 transition-all  bg-mauve! text-white!',
                      isSelected && [
                        'bg-mauve text-white hover:bg-destructive! hover:border-destructive!',
                        'dark:hover:bg-destructive/20! dark:hover:text-destructive!',
                      ]
                    )}
                  >
                    {isSelected ? (
                      <>
                        {/* Shown by default */}
                        <div className="flex items-center group-hover:hidden">
                          <Check size={14} className="mr-1" />
                          <span>Active</span>
                        </div>
                        {/* Shown on hover */}
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
