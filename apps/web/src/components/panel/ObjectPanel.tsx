import {
  ArrowBigDown,
  ArrowBigUp,
  Copy,
  Cuboid,
  Hand,
  Trash,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import FormThree from '../global/FormThree';
import { Button } from '../ui/button';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col gap-2! p-4 h-full w-full sm:max-w-md border-l bg-sidebar shadow-2xl overflow-hidden rounded-none">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Object Name</CardTitle>
      </CardHeader>

      {/* Top Action Bar */}
      <div className="w-full border-b flex gap-2 items-center justify-center px-4 py-2">
        <Button
          className="icon-round-btn"
          onClick={() => navigate('/app/voxel')}
        >
          <Cuboid className="size-6!" />
        </Button>
        <Button className="icon-round-btn">
          <Hand className="size-6!" />
        </Button>
      </div>

      <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar">
        <div>
          <FormThree
            inputs={objectConfigInputs['transform']}
            store={useObjectStore}
            sliceKey={'transform'}
          />
        </div>

        <Separator className="my-3! bg-border" />

        <div>
          <Accordion type="multiple" className="max-w-lg">
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
        </div>
      </CardContent>

      {/* Bottom Sticky Action Bar */}
      <div className="w-full p-2 border-t bg-sidebar flex gap-2 items-center justify-center">
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
    </Card>
  );
};
