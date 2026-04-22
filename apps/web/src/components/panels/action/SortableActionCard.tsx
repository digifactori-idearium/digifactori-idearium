import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Zap } from 'lucide-react';

import { TooltipButton } from '@/components/common/button';
import { FormInputData, ActionConfigForm } from '@/components/common/form';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionRegistry } from '@/lib/actions/registery';
import { cn } from '@/lib/utils';
import { actions, sceneState } from '@/stores';
export function SortableActionCard({
  action,
  selectedId,
  isDragOverlay = false,
}: {
  action: ActionConfig;
  selectedId: string;
  isDragOverlay?: boolean;
}) {
  const reg = ActionRegistry[action.subType];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <AccordionItem
      ref={setNodeRef}
      style={style}
      value={action.id}
      className={cn(
        'border rounded-xl bg-white/5 overflow-hidden transition-all',
        isDragging && !isDragOverlay
          ? 'opacity-30 border-dashed border-white/20'
          : 'border-white/10 hover:border-yellow-400'
      )}
    >
      <div className="flex items-center gap-2 px-2">
        {/* Drag handle */}
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing p-1 text-white/50 hover:text-white/70 touch-none"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="size-4" />
        </button>

        <Zap className="size-3 text-yellow-400 shrink-0" />

        <AccordionTrigger className="flex-1 py-3 hover:no-underline text-sm capitalize text-white [&>svg]:text-white! ">
          {reg?.label || action.subType}
        </AccordionTrigger>

        {/* Round checkbox */}
        <Checkbox
          className={cn(
            'size-4 rounded-full border-white/40 shrink-0',
            'data-[state=checked]:bg-mauve! data-[state=checked]:border-mauve! data-[state=checked]:text-white!'
          )}
          checked={action.active ?? true}
          onCheckedChange={checked => {
            const obj = sceneState.objects[selectedId];
            if (!obj) return;
            const found = obj.actions?.find(a => a.id === action.id);
            if (!found) return;
            found.active = checked === true;
            actions.bumpActionsVersion(selectedId);
          }}
          onClick={e => e.stopPropagation()}
        />

        <TooltipButton
          tooltip="Supprimer"
          onClick={e => {
            e.stopPropagation();
            actions.removeAction(selectedId, action.id);
          }}
          className="group bg-transparent! hover:text-red-700! p-1! shrink-0"
        >
          <Trash2 className="size-3.5 text-white/80 group-hover:text-red-700!" />
        </TooltipButton>
      </div>

      <AccordionContent className="px-3 pb-3 pt-2 border-t border-white/5">
        <ActionConfigForm
          key={action.id}
          inputs={(reg?.inputs as FormInputData[]) || []}
          objectId={selectedId}
          actionId={action.id}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
