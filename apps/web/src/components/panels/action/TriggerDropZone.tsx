import { useDroppable } from '@dnd-kit/core';

import { cn } from '@/lib/utils';

export function TriggerDropZone({
  triggerKey,
  isOver,
  label,
}: {
  triggerKey: string;
  isOver: boolean;
  label: string;
}) {
  const { setNodeRef } = useDroppable({ id: `trigger-drop-${triggerKey}` });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute inset-0 rounded-lg border-2 border-dashed z-10 flex items-center justify-center transition-all pointer-events-none',
        isOver
          ? 'border-mauve bg-mauve/60 opacity-100'
          : 'border-transparent opacity-0'
      )}
    >
      <span className="text-xs text-white font-medium px-3 py-1.5 rounded-full">
        Déposer ici → {label}
      </span>
    </div>
  );
}
