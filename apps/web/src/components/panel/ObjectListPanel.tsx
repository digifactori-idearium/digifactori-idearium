import { useSnapshot } from 'valtio';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { getContrastColor } from '@/lib/3d';
import { sceneState, actions } from '@/stores/room.store';

export const ObjectListPanel = () => {
  const snap = useSnapshot(sceneState);
  const textColor = getContrastColor(snap.background.color);

  const hierarchy = buildHierarchy(snap.objects);

  function buildHierarchy(objects: typeof snap.objects) {
    const map: Record<string, any> = {};
    const roots: any[] = [];

    Object.entries(objects).forEach(([id, obj]) => {
      map[id] = { id, ...obj, children: [] };
    });

    Object.values(map).forEach(obj => {
      if (obj.advanced.parent && map[obj.advanced.parent]) {
        map[obj.advanced.parent].children.push(obj);
      } else {
        roots.push(obj);
      }
    });

    return roots;
  }

  const renderNode = (node: any) => {
    const isActive = snap.selectedObjectId === node.id;

    if (node.children.length === 0) {
      return (
        <div
          key={node.id}
          onClick={() => actions.selectObject(node.id)}
          className={`
            p-1.5 rounded-md cursor-pointer transition-all w-fit!
            ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}
          `}
        >
          {node.info.name}
        </div>
      );
    }

    return (
      <AccordionItem key={node.id} value={node.id} className="border-none">
        <AccordionTrigger
          onClick={() => actions.selectObject(node.id)}
          className={`
            p-1.5 hover:no-underline w-fit!
            ${isActive ? 'bg-white/20 rounded-md' : ''}
          `}
        >
          {node.info.name}
        </AccordionTrigger>

        <AccordionContent className="ml-4 space-y-1">
          {node.children.map((child: any) => renderNode(child))}
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Card
      className={`
        h-full
        bg-transparent
        border-none! shadow-none
        p-0!
        pt-3!
        ${textColor}
      `}
    >
      <CardContent className="overflow-y-auto custom-scrollbar p-0!">
        <Accordion type="multiple" className="w-full">
          {hierarchy.map(node => renderNode(node))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
