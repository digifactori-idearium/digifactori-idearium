import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ArrowLeft, GripVertical, Zap } from 'lucide-react';
import { useState } from 'react';
import { useSnapshot } from 'valtio';

import { TriggerSection } from './action/TriggerSection';

import { TooltipButton } from '@/components/common/button';
import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ActionRegistry } from '@/lib/actions/registery';
import { actions, sceneState } from '@/stores';

export const TRIGGER_DEFINITIONS: TriggerDefinition[] = [
  {
    key: 'onStart',
    icon: '▶',
    label: 'Au début',
    description: 'Dès que le jeu commence',
  },
  {
    key: 'onTap',
    icon: '👆',
    label: 'Quand je tape',
    description: "En cliquant sur l'objet",
  },
  // Add more triggers here
];

export const ActionPanel = () => {
  const snap = useSnapshot(sceneState);
  const selectedId = snap.selectedObjectId;
  const obj = selectedId ? snap.objects[selectedId] : null;

  const [activeAction, setActiveAction] = useState<ActionConfig | null>(null);
  const [overTrigger, setOverTrigger] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const getActionTrigger = (actionId: string): string | null => {
    for (const action of obj?.actions || []) {
      if (action.id === actionId) return action.trigger;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const action = obj?.actions?.find(a => a.id === event.active.id);
    if (action) setActiveAction(action);
  };

  const handleDragOver = (event: any) => {
    const overId = event.over?.id as string | undefined;
    if (overId?.startsWith('trigger-drop-')) {
      setOverTrigger(overId.replace('trigger-drop-', ''));
    } else {
      setOverTrigger(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveAction(null);
    setOverTrigger(null);

    if (!over || !selectedId) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // inter-trigger transfer
    if (overId.startsWith('trigger-drop-')) {
      const toTrigger = overId.replace('trigger-drop-', '');
      const fromTrigger = getActionTrigger(activeId);
      if (!fromTrigger || fromTrigger === toTrigger) return;

      const storeObj = sceneState.objects[selectedId];
      if (!storeObj?.actions) return;
      const found = storeObj.actions.find(a => a.id === activeId);
      if (!found) return;
      found.trigger = toTrigger as TriggerType;
      actions.bumpActionsVersion(selectedId);
      return;
    }

    // Reorder in the same trigger
    const fromTrigger = getActionTrigger(activeId);
    const toTrigger = getActionTrigger(overId);
    if (!fromTrigger || fromTrigger !== toTrigger) return;

    const storeObj = sceneState.objects[selectedId];
    if (!storeObj?.actions) return;

    const triggerActions = storeObj.actions.filter(
      a => a.trigger === fromTrigger
    );
    const others = storeObj.actions.filter(a => a.trigger !== fromTrigger);

    const oldIndex = triggerActions.findIndex(a => a.id === activeId);
    const newIndex = triggerActions.findIndex(a => a.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(triggerActions, oldIndex, newIndex);
    storeObj.actions = [...others, ...reordered];
    actions.bumpActionsVersion(selectedId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Card className="flex flex-col gap-3 p-4 h-full w-full sm:max-w-md border-none! bg-sidebar-dark/25 text-white! shadow-2xl overflow-hidden rounded-none">
        {/* Header */}
        <CardHeader className="p-0 flex flex-row items-center gap-3">
          <TooltipButton
            variant={'ghost'}
            tooltip="Retour"
            onClick={() => actions.setSettingView('model')}
            className="hover:bg-white/10 p-1! bg-transparent rounded border border-white/20!"
          >
            <ArrowLeft className="size-5 text-white" />
          </TooltipButton>
          <div>
            <p className="text-base font-semibold text-white leading-none">
              Mes actions
            </p>
            <p className="text-xs text-white/90 mt-0.5">
              Glisse une action pour la déplacer ou changer son moment
            </p>
          </div>
        </CardHeader>

        {/* Trigger accordion list */}
        <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar">
          <Accordion
            type="multiple"
            defaultValue={TRIGGER_DEFINITIONS.map(t => t.key)}
            className="space-y-2"
          >
            {TRIGGER_DEFINITIONS.map(trigger => {
              const triggerActions = (obj?.actions || []).filter(
                a => a.trigger === trigger.key
              );
              return (
                <TriggerSection
                  key={trigger.key}
                  trigger={trigger}
                  triggerActions={triggerActions as ActionConfig[]}
                  selectedId={selectedId!}
                  isOver={overTrigger === trigger.key}
                />
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Floating drag overlay */}
      <DragOverlay dropAnimation={null}>
        {activeAction && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-mauve bg-mauve/20 text-white text-sm shadow-xl w-56">
            <GripVertical className="size-4 text-mauve/60" />
            <Zap className="size-3 text-yellow-400" />
            <span className="capitalize">
              {ActionRegistry[activeAction.subType]?.label ||
                activeAction.subType}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
