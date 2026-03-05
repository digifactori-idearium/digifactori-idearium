import { memo, useCallback } from 'react';
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

function useSelectedId() {
  const snap = useSnapshot(sceneState, { sync: false });
  return snap.selectedObjectId;
}

function useTextColor() {
  const snap = useSnapshot(sceneState.background);
  return getContrastColor(snap.color);
}

function useObjectsHierarchy() {
  const snap = useSnapshot(sceneState.objects);

  const map: Record<string, any> = {};
  const roots: any[] = [];

  Object.entries(snap).forEach(([id, obj]) => {
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

const ObjectNode = memo(
  ({ node, depth = 0 }: { node: any; depth?: number }) => {
    const selectedId = useSelectedId();
    const isActive = selectedId === node.id;

    const handleClick = useCallback(() => {
      actions.selectObject(node.id);
    }, [node.id]);

    if (node.children.length === 0) {
      return (
        <div
          onClick={handleClick}
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
      <AccordionItem value={node.id} className="border-none">
        <AccordionTrigger
          onClick={handleClick}
          className={`
          p-1.5 hover:no-underline w-fit!
          ${isActive ? 'bg-white/20 rounded-md' : ''}
        `}
        >
          {node.info.name}
        </AccordionTrigger>
        <AccordionContent className="ml-4 space-y-1">
          {node.children.map((child: any) => (
            <ObjectNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }
);

export const ObjectListPanel = memo(() => {
  const textColor = useTextColor();
  const hierarchy = useObjectsHierarchy();

  return (
    <Card
      className={`h-full bg-transparent border-none! shadow-none p-0! pt-3! ${textColor}`}
    >
      <CardContent className="overflow-y-auto custom-scrollbar p-0!">
        <Accordion type="multiple" className="w-full">
          {hierarchy.map(node => (
            <ObjectNode key={node.id} node={node} />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
});
