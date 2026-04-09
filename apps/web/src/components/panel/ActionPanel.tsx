import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2, Zap } from 'lucide-react';
import { useSnapshot } from 'valtio';

import { SuperButton, TooltipButton } from '@/components/common/button';
import { FormInputData, ActionConfigForm } from '@/components/common/form';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActionRegistry } from '@/lib/actions/registery';
import { actions, sceneState } from '@/stores';

export const ActionPanel = () => {
  const snap = useSnapshot(sceneState);
  const selectedId = snap.selectedObjectId;
  const obj = selectedId ? snap.objects[selectedId] : null;

  const activeTrigger = snap.pendingTrigger || 'onStart';

  // Filter actions for the selected trigger
  const currentActions = (obj?.actions || []).filter(
    a => a.trigger === activeTrigger
  );

  return (
    <Card className="flex flex-col gap-2! p-4 h-full w-full sm:max-w-md border-none! bg-sidebar-dark/25 text-white! shadow-2xl overflow-hidden rounded-none">
      <CardHeader className="p-0 flex justify-between items-center">
        <div className="flex items-center gap-2 dialog-btn">
          <TooltipButton
            tooltip="Retour"
            onClick={() => actions.setSettingView('model')}
          >
            <ArrowLeft className="size-5" />
          </TooltipButton>
          <CardTitle className="text-xl font-bold">Actions</CardTitle>
        </div>
      </CardHeader>
      <span className="text-white text-xs mt-1">L'action se fait quand</span>

      <Tabs
        value={activeTrigger}
        onValueChange={v => {
          sceneState.pendingTrigger = v as TriggerType;
        }}
        className="mt-1"
      >
        <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent">
          <TabsTrigger
            className="p-1! bg-transparent! data-[state=active]:text-white! data-[state=active]:border-mauve! data-[state=active]:border-2! hover:border-white"
            value="onStart"
          >
            Au début
          </TabsTrigger>
          <TabsTrigger
            className="p-1! bg-transparent! data-[state=active]:text-white! data-[state=active]:border-mauve! data-[state=active]:border-2! hover:border-white"
            value="onTap"
          >
            Quand je tap
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <CardContent className="flex-1 overflow-y-auto p-0 mt-4 custom-scrollbar">
        <Accordion type="single" className="space-y-2">
          {currentActions.map(action => {
            const reg = ActionRegistry[action.subType];
            return (
              <AccordionItem
                key={action.id}
                value={action.id}
                className="border border-white/10 rounded-lg bg-white/5 px-2 hover:border-yellow-400"
              >
                <div className="flex items-center justify-between gap-2">
                  <Zap className="size-3 text-yellow-400" />
                  <AccordionTrigger className="flex-1 py-3 hover:no-underline text-xs capitalize">
                    {reg?.label || action.subType}
                  </AccordionTrigger>
                  <div>
                    <TooltipButton
                      tooltip="Faire monter"
                      onClick={() =>
                        actions.reorderAction(selectedId!, action.id, 'up')
                      }
                      className="bg-transparent! p-1!"
                    >
                      <ArrowUp className="size-4 text-white hover:text-red-400!" />
                    </TooltipButton>
                    <TooltipButton
                      tooltip="Faire descendre"
                      onClick={() =>
                        actions.reorderAction(selectedId!, action.id, 'down')
                      }
                      className="bg-transparent! p-1!"
                    >
                      <ArrowDown className="size-4 text-white hover:text-red-400" />
                    </TooltipButton>
                    <TooltipButton
                      tooltip="Supprimer"
                      onClick={() =>
                        actions.removeAction(selectedId!, action.id)
                      }
                      className="bg-transparent! p-1!"
                    >
                      <Trash2 className="size-4 text-white! hover:text-red-400!" />
                    </TooltipButton>
                    <Checkbox
                      className="size-4 data-[state=checked]:bg-mauve! data-[state=checked]:text-white!"
                      checked={action.active ?? true}
                      onCheckedChange={checked => {
                        const obj = sceneState.objects[selectedId!];
                        if (!obj) return;

                        const found = obj.actions?.find(
                          a => a.id === action.id
                        );
                        if (!found) return;

                        found.active = checked === true;
                        actions.bumpActionsVersion(selectedId!);
                      }}
                    />
                  </div>
                </div>
                <AccordionContent className="pt-2 border-t border-white/5">
                  <ActionConfigForm
                    inputs={(reg?.inputs as FormInputData[]) || []}
                    objectId={selectedId as string}
                    actionId={action.id}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <SuperButton
          className="w-full mt-3 form-button"
          onClick={() => actions.openActionPicker(true)}
        >
          <Plus className="mr-2 size-4" /> Ajouter une action
        </SuperButton>
      </CardContent>
    </Card>
  );
};
