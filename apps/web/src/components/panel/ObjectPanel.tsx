import {
  ArrowBigDown,
  ArrowBigUp,
  Copy,
  Cuboid,
  Hand,
  Trash,
} from 'lucide-react';

import FormThree from '../global/FormThree';
import { Button } from '../ui/button';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { objectConfigInputs } from '@/lib/input';
import { useObjectStore } from '@/stores';

interface AccordionSection {
  id: 'info' | 'transform' | 'style' | 'advanced';
  label: string;
}

const accordionSections: AccordionSection[] = [
  { id: 'style', label: 'Style' },
  { id: 'advanced', label: 'Advanced' },
];

export const ObjectConfigPanel = () => {
  return (
    <SheetContent className="dialog-btn gap-1! bg-sidebar">
      <SheetHeader>
        <SheetTitle className="text-2xl">Object Configuration</SheetTitle>
      </SheetHeader>

      <div className="w-full flex gap-2 items-center justify-center">
        <Button className="icon-round-btn">
          <Cuboid className="size-6!" />
        </Button>
        <Button className="icon-round-btn">
          <Hand className="size-6!" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div>
          <FormThree
            inputs={objectConfigInputs['transform']}
            store={useObjectStore}
            sliceKey={'transform'}
          />
        </div>

        <Separator className="my-3!" />

        <div>
          <Accordion
            type="single"
            collapsible
            defaultValue="info"
            className="max-w-lg"
          >
            {accordionSections.map(section => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="accordion-btn">
                  {section.label}
                </AccordionTrigger>

                <AccordionContent className="pt-3 px-4">
                  <FormThree
                    inputs={
                      objectConfigInputs[
                        section.id as keyof typeof objectConfigInputs
                      ]
                    }
                    store={useObjectStore}
                    sliceKey={section.id}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Separator className="my-3!" />
        </div>
      </div>
      <div className="w-full my-3 flex gap-2 items-center justify-center">
        <Button className="icon-round-btn">
          <ArrowBigDown className="size-6!" />
        </Button>
        <Button className="icon-round-btn">
          <ArrowBigUp className="size-6!" />
        </Button>
        <Button className="icon-round-btn">
          <Copy className="size-6!" />
        </Button>
        <Button className="icon-round-btn">
          <Trash className="size-6!" />
        </Button>
      </div>
    </SheetContent>
  );
};
