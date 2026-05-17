import { X } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useSnapshot } from 'valtio';

import { SuperButton } from '@/components/common/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { sceneState, actions } from '@/stores/ideorama.store';

function useSelectedId() {
  const snap = useSnapshot(sceneState, { sync: false });
  return snap.selectedObjectId;
}

// function useTextColor() {
//   const snap = useSnapshot(sceneState.background);
//   return getContrastColor(snap.color);
// }

function useObjectsHierarchy() {
  const snap = useSnapshot(sceneState.objects);

  const map: Record<string, any> = {};
  const roots: any[] = [];

  Object.entries(snap).forEach(([id, obj]) => {
    map[id] = { id, ...obj, children: [] };
  });

  Object.values(map).forEach(obj => {
    const parentId = obj.advanced.parent;
    const isValid = parentId && map[parentId];

    if (isValid) {
      map[parentId].children.push(obj);
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

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        actions.selectObject(node.id);
      },
      [node.id]
    );

    if (node.children.length === 0) {
      return (
        <div
          onClick={handleClick}
          className={`
          p-1.5 mb-1 rounded-sm cursor-pointer transition-all w-full!
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
          p-1.5 rounded-sm hover:no-underline w-full! [&>svg]:text-white!
          ${isActive ? 'bg-white/20' : ''}
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
  const snap = useSnapshot(sceneState);
  const hierarchy = useObjectsHierarchy();

  if (!snap.assetsTreeOpen) return null;

  return (
    <div className="absolute left-4 bottom-5 w-80 h-145 z-60 animate-in slide-in-from-bottom-10">
      <div className="flex flex-col h-full backdrop-blur-xl bg-neutral-600/5 border border-white/20 rounded-2xl shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
          <h2 className="font-semibold text-lg">Ma list D'object</h2>

          <div className="flex items-center gap-2">
            <SuperButton
              tooltip="Fermer"
              onClick={() => actions.toggleAssetsTree(false)}
              className="hover:bg-white/10 p-1! bg-transparent! rounded border border-white/20!"
            >
              <X className="size-5 text-white!" />
            </SuperButton>
          </div>
        </div>

        <Card
          className={`h-full bg-transparent border-none! shadow-none p-2! pt-3! text-white!`}
        >
          <CardContent className="overflow-y-auto custom-scrollbar p-0!">
            <Accordion type="multiple" className="w-full ">
              {hierarchy.map(node => (
                <ObjectNode key={node.id} node={node} />
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
