import { X } from 'lucide-react';
import { useSnapshot } from 'valtio';

import { TooltipButton } from '@/components/common/button';
import { FormThree } from '@/components/common/form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ideoramaConfigInputs } from '@/lib/input';
import { actions, sceneState } from '@/stores';

type IdeoramaSliceKey = 'global' | 'floor' | 'info' | 'background';

interface AccordionSection {
  id: IdeoramaSliceKey;
  label: string;
  input: keyof typeof ideoramaConfigInputs;
}

const accordionSections: AccordionSection[] = [
  { id: 'info', label: 'Information', input: 'info' },
  { id: 'floor', label: 'Sol', input: 'part' },
  { id: 'background', label: 'Arrière-plan', input: 'background' },
];

export const ConfigPanel = () => {
  const snap = useSnapshot(sceneState);

  return (
    <Card className="flex flex-col p-4 gap-2! h-full w-full bg-sidebar-dark/25 text-white! border-none! border-transparent! outline-none! sm:max-w-md shadow-2xl overflow-hidden rounded-none">
      <CardHeader className="p-0 flex justify-between items-center">
        <CardTitle className="text-xl font-bold">
          {snap.info.name || 'Ideorama'}
        </CardTitle>
        <TooltipButton
          variant={'ghost'}
          tooltip="Fermer"
          onClick={() => actions.toggleSettingPanel(false)}
          className="hover:bg-white/10 p-1! bg-transparent rounded border border-white/20!"
        >
          <X className="size-5 text-white!" />
        </TooltipButton>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <div className="pt-2">
          <FormThree
            key={'global'}
            inputs={ideoramaConfigInputs['global']}
            sliceKey="global"
          />
        </div>

        <Separator className="mt-3! bg-zinc-400/40!" />

        <div className="flex-1 min-h-0 mt-3">
          <ScrollArea className="h-full">
            <Accordion type="multiple" className="w-full pr-3 space-y-2">
              {accordionSections.map(section => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border border-white/10 rounded-lg bg-white/5 px-2 hover:border-yellow-400"
                >
                  <AccordionTrigger className="accordion-btn hover:no-underline py-3">
                    {section.label}
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 border-t border-white/5">
                    <FormThree
                      key={section.id}
                      inputs={ideoramaConfigInputs[section.input]}
                      sliceKey={section.id}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigPanel;
