import { useSnapshot } from 'valtio';

import FormThree from '../global/FormThree';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { roomConfigInputs } from '@/lib/input';
import { sceneState } from '@/stores';

type RoomSliceKey =
  | 'global'
  | 'info'
  | 'leftWall'
  | 'rightWall'
  | 'floor'
  | 'background';

interface AccordionSection {
  id: RoomSliceKey;
  label: string;
  input: keyof typeof roomConfigInputs;
}

const accordionSections: AccordionSection[] = [
  { id: 'info', label: 'Information', input: 'info' },
  { id: 'background', label: 'Arrière-plan', input: 'background' },
  { id: 'leftWall', label: 'Mur Gauche', input: 'part' },
  { id: 'rightWall', label: 'Mur Droit', input: 'part' },
  { id: 'floor', label: 'Sol', input: 'part' },
];

export const ConfigPanel = () => {
  const snap = useSnapshot(sceneState);

  return (
    <Card className="flex flex-col p-4 gap-2! h-full w-full bg-sidebar sm:max-w-md border-none! shadow-2xl overflow-hidden rounded-none">
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-bold">
          {snap.info.name || 'Room'}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <div className="pt-2">
          <FormThree inputs={roomConfigInputs['global']} sliceKey="global" />
        </div>

        <Separator className="mt-3! bg-border!" />

        <div className="flex-1 min-h-0 mt-3">
          <ScrollArea className="h-full">
            <Accordion type="multiple" className="w-full">
              {accordionSections.map(section => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border-b-0"
                >
                  <AccordionTrigger className="accordion-btn hover:no-underline py-3">
                    {section.label}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pl-5 pt-2">
                    <FormThree
                      inputs={roomConfigInputs[section.input]}
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
