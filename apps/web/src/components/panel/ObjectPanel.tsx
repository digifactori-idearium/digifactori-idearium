import {
  ArrowBigDown,
  ArrowBigUp,
  Copy,
  Cuboid,
  Hand,
  Trash,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSnapshot } from 'valtio';

import { FormThree } from '@/components/global';
import { SuperButton } from '@/components/global';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { objectConfigInputs } from '@/lib/input';
import { sceneState, actions } from '@/stores/ideorama.store';

type ConfigSlice = 'transform' | 'style' | 'advanced';

interface AccordionSection {
  id: ConfigSlice;
  label: string;
}

const accordionSections: AccordionSection[] = [
  { id: 'style', label: 'Style' },
  { id: 'advanced', label: 'Advanced' },
];

export const ObjectConfigPanel = () => {
  const navigate = useNavigate();

  const snap = useSnapshot(sceneState);
  const selectedId = snap.selectedObjectId;

  const selectedObjectData = selectedId ? snap.objects[selectedId] : null;

  const handleDelete = () => {
    if (!selectedId) return;
    actions.removeObject(selectedId);
    actions.selectObject(null);
  };

  return (
    <Card className="flex flex-col gap-2! p-4 h-full w-full sm:max-w-md border-none! bg-sidebar-dark/25 text-white! shadow-2xl overflow-hidden rounded-none">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {selectedObjectData?.info.name || 'Object Configuration'}
        </CardTitle>
      </CardHeader>

      {/* Top Action Bar */}
      <div className="w-full border-b border-zinc-400/40! flex gap-2 items-center justify-center px-4 py-2">
        <SuperButton
          tooltip="Modifier l'objet"
          voiceText="Modifier l'objet"
          className="icon-round-btn"
          onClick={() => navigate('/app/voxel')}
        >
          <Cuboid className="size-6!" />
        </SuperButton>
        <SuperButton
          className="icon-round-btn"
          tooltip="Ajouter des actions"
          voiceText="Ajouter des actions"
        >
          <Hand className="size-6!" />
        </SuperButton>
      </div>

      <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar">
        {/* Transform Section (Always visible) */}
        <div className="px-4 pt-2">
          <FormThree
            inputs={objectConfigInputs['transform']}
            objectId={selectedId}
            sliceKey="transform"
          />
        </div>

        <Separator className="my-3! bg-zinc-400/40!" />

        {/* Style & Advanced Sections (Accordion) */}
        <div className="px-1">
          <Accordion type="multiple" className="w-full">
            {accordionSections.map(section => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border-none"
              >
                <AccordionTrigger className="accordion-btn hover:no-underline py-2 px-3">
                  {section.label}
                </AccordionTrigger>

                <AccordionContent className="pt-3 px-3">
                  <FormThree
                    inputs={objectConfigInputs[section.id]}
                    objectId={selectedId}
                    sliceKey={section.id}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>

      {/* Bottom Sticky Action Bar */}
      <div className="w-full p-2 border-t border-zinc-400/40! flex gap-2 items-center justify-center">
        <SuperButton
          className="icon-round-btn"
          tooltip="Télécharger l'objet"
          voiceText="Télécharger l'objet"
        >
          <ArrowBigDown className="size-6!" />
        </SuperButton>
        <SuperButton
          className="icon-round-btn"
          tooltip="Ajouter un objet"
          voiceText="Ajouter un objet"
        >
          <ArrowBigUp className="size-6!" />
        </SuperButton>
        <SuperButton
          className="icon-round-btn"
          tooltip="Copier l'objet"
          voiceText="Copier l'objet"
          // onClick={() => actions.duplicateObject(selectedId)}
        >
          <Copy className="size-6!" />
        </SuperButton>
        <SuperButton
          tooltip="Supprimer l'objet"
          voiceText="Supprimer l'objet"
          className="icon-round-btn bg-red-900/20! hover:bg-red-900/40! text-red-500!"
          onClick={handleDelete}
        >
          <Trash className="size-6!" />
        </SuperButton>
      </div>
    </Card>
  );
};
