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
import { useRoomStore } from '@/stores';

interface AccordionSection {
  id: 'global' | 'info' | 'leftWall' | 'rightWall' | 'floor' | 'background';
  label: string;
  input: 'global' | 'info' | 'part' | 'background';
}

const accordionSections: AccordionSection[] = [
  { id: 'info', label: 'Information', input: 'info' },
  { id: 'background', label: 'Arrière-plan', input: 'background' },
  { id: 'leftWall', label: 'Mur Gauche', input: 'part' },
  { id: 'rightWall', label: 'Mur Droit', input: 'part' },
  { id: 'floor', label: 'Sol', input: 'part' },
];

export const ConfigPanel = () => {
  return (
    <Card className="flex flex-col p-4 gap-2! h-full w-full bg-sidebar sm:max-w-md border-none! shadow-2xl overflow-hidden">
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-bold">Room Name</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <div>
          <FormThree
            inputs={roomConfigInputs['global']}
            store={useRoomStore}
            sliceKey="global"
          />
        </div>

        <Separator className="mt-3! bg-border!" />

        <div className="flex-1 min-h-0 mt-3">
          <ScrollArea className="h-full">
            <Accordion type="multiple" className="max-w-lg">
              {accordionSections.map(section => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="accordion-btn">
                    {section.label}
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <FormThree
                      inputs={roomConfigInputs[section.input]}
                      store={useRoomStore}
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
