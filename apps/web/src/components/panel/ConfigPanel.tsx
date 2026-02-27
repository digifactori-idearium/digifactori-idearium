import FormThree from '../global/FormThree';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { roomConfigInputs } from '@/lib/input';

interface AccordionSection {
  id: string;
  label: string;
  input: 'global' | 'info' | 'part';
}
const accordionSections: AccordionSection[] = [
  { id: 'info', label: 'Information', input: 'info' },
  { id: 'leftWall', label: 'Mur Gauche', input: 'part' },
  { id: 'rightWall', label: 'Mur Droit', input: 'part' },
  { id: 'floor', label: 'Sol', input: 'part' },
];

export const ConfigPanel = () => {
  return (
    <SheetContent className="dialog-btn bg-sidebar">
      <SheetHeader>
        <SheetTitle className="text-3xl">Room Name</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div>
          <FormThree
            inputs={roomConfigInputs['global']}
            storeKey="room"
            sliceKey="global"
          />
        </div>
        <Separator className="my-3!" />
        <div>
          <Accordion
            type="single"
            collapsible
            defaultValue="item-1"
            className="max-w-lg"
          >
            {accordionSections.map(section => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="accordion-btn">
                  {section.label}
                </AccordionTrigger>
                <AccordionContent className="pt-3 px-4">
                  <FormThree
                    inputs={roomConfigInputs[section.input]}
                    storeKey="room"
                    sliceKey={section.id}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </SheetContent>
  );
};
