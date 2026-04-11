import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChevronDown, Plus } from 'lucide-react';

import { SortableActionCard } from './SortableActionCard';
import { TriggerDropZone } from './TriggerDropZone';

import { SuperButton } from '@/components/common/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { actions, sceneState } from '@/stores';

export function TriggerSection({
  trigger,
  triggerActions,
  selectedId,
  isOver,
}: {
  trigger: TriggerDefinition;
  triggerActions: ActionConfig[];
  selectedId: string;
  isOver: boolean;
}) {
  return (
    <AccordionItem
      value={trigger.key}
      className="border border-white/10 rounded-xl overflow-hidden bg-white/3"
    >
      {/* Trigger header */}
      <AccordionTrigger className="px-3 py-2.5 hover:no-underline hover:bg-white/5 [&>svg]:hidden w-full">
        <div className="flex items-center gap-3 w-full">
          <div className="size-8 rounded-full bg-white/10 flex items-center justify-center text-base shrink-0">
            {trigger.icon}
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">
              {trigger.label}
            </div>
            <div className="text-xs text-white/90">{trigger.description}</div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-mauve/40 text-white font-medium mr-1">
            {triggerActions.length}
          </span>
          <ChevronDown className="size-4 text-white/90 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-2 pb-2">
        {/* Drop zone overlay */}
        <div className="relative">
          <TriggerDropZone
            triggerKey={trigger.key}
            isOver={isOver}
            label={trigger.label}
          />

          <SortableContext
            items={triggerActions.map(a => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <Accordion type="single" collapsible className="space-y-1.5 mt-2">
              {triggerActions.length === 0 ? (
                <div className="text-center py-4 text-white/80 text-xs border border-dashed border-white/60 rounded-lg">
                  Pas encore d'action — glisse-en une ici ou clique +
                </div>
              ) : (
                triggerActions.map(action => (
                  <SortableActionCard
                    key={action.id}
                    action={action}
                    selectedId={selectedId}
                  />
                ))
              )}
            </Accordion>
          </SortableContext>
        </div>

        <SuperButton
          onClick={() => {
            sceneState.pendingTrigger = trigger.key as TriggerType;
            actions.openActionPicker(true);
          }}
          className="w-full mt-2 form-button"
        >
          <Plus className="size-3.5" />
          Ajouter une action
        </SuperButton>
      </AccordionContent>
    </AccordionItem>
  );
}
