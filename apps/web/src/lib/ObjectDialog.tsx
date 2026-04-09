import { Box, Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSnapshot } from 'valtio';

import { Search } from '@/components/global/Search';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { sceneState } from '@/stores';

interface ObjectSelectorProps {
  type?: 'parent' | 'action';
}

function setParent(objId: string, id: string) {
  const current = sceneState.objects[objId].advanced.parent;
  sceneState.objects[objId].advanced.parent = current === id ? '' : id;
}

function setDeleteObjectId(objId: string, trigger: string, id: string) {
  const actions = sceneState.objects[objId].actions;
  const targetAction = actions?.find(
    a => a.subType === 'delete' && a.type === 'utility' && a.trigger === trigger
  );
  if (targetAction) {
    targetAction.config.delete_object_id =
      targetAction.config.delete_object_id === id ? '' : id;
  }
}

export function ObjectSelector({ type = 'parent' }: ObjectSelectorProps) {
  const snap = useSnapshot(sceneState);
  const trigger = snap.pendingTrigger;
  const selectedObjectId = snap.selectedObjectId;
  const sceneSelectedObject = selectedObjectId
    ? snap.objects[selectedObjectId]
    : null;

  const [searchQuery, setSearchQuery] = useState('');

  const selectedValue = useMemo(() => {
    if (type === 'parent') {
      return sceneSelectedObject?.advanced.parent ?? '';
    }
    const action = sceneSelectedObject?.actions?.find(
      a =>
        a.subType === 'delete' && a.type === 'utility' && a.trigger === trigger
    );
    return action?.config?.delete_object_id ?? '';
  }, [type, sceneSelectedObject, trigger]);

  const objectList = useMemo(() => {
    return Object.entries(snap.objects).map(([id, obj]) => ({
      id,
      name: obj.info.name || 'Sans nom',
      preview: obj.info.preview,
    }));
  }, [snap.objects]);

  const filteredList = useMemo(() => {
    if (!searchQuery) return objectList;
    return objectList.filter(o =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [objectList, searchQuery]);

  const searchOptions = useMemo(
    () => objectList.map(o => ({ value: o.id, label: o.name })),
    [objectList]
  );

  const selectObject = (id: string) => {
    const objId = sceneState.selectedObjectId;
    const currentTrigger = sceneState.pendingTrigger;
    if (!objId) return;

    if (type === 'parent') {
      setParent(objId, id);
      return;
    }

    if (!currentTrigger) return;
    setDeleteObjectId(objId, currentTrigger, id);
  };

  return (
    <div className="flex flex-col gap-3">
      <Search
        label="object"
        options={searchOptions}
        onSelect={id => {
          // Scroll-to / highlight via searchQuery filter
          const found = objectList.find(o => o.id === id);
          if (found) setSearchQuery(found.name);
        }}
      />
      <ScrollArea className="h-72 pr-4">
        <div className="flex flex-col gap-2">
          {filteredList.map(object => {
            const isSelected = selectedValue === object.id;

            return (
              <div
                key={object.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-all duration-200',
                  isSelected
                    ? 'border-mauve bg-mauve/5 dark:bg-mauve/10 shadow-sm'
                    : 'border-border bg-card hover:bg-accent/50'
                )}
              >
                <div className="flex items-center gap-3">
                  {object.preview ? (
                    <img
                      src={object.preview}
                      alt={object.name}
                      className="w-10 h-10 rounded-md object-cover border"
                    />
                  ) : (
                    <div
                      className={cn(
                        'p-2 rounded-md transition-colors',
                        isSelected
                          ? 'bg-mauve text-white'
                          : 'bg-secondary text-muted-foreground'
                      )}
                    >
                      <Box size={18} />
                    </div>
                  )}

                  <span
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isSelected ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {object.name}
                  </span>
                </div>

                <Button
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => selectObject(object.id)}
                  className={cn(
                    'group min-w-22.5 transition-all bg-mauve! text-white!',
                    isSelected && [
                      'bg-mauve text-white hover:bg-destructive! hover:border-destructive!',
                      'dark:hover:bg-destructive/20! dark:hover:text-destructive!',
                    ]
                  )}
                >
                  {isSelected ? (
                    <>
                      <div className="flex items-center group-hover:hidden">
                        <Check size={14} className="mr-1" />
                        <span>Parent</span>
                      </div>
                      <span className="hidden group-hover:inline text-xs">
                        Retirer
                      </span>
                    </>
                  ) : (
                    'Choisir'
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
