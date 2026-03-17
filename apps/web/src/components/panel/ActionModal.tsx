import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useSnapshot } from 'valtio';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ActionRegistry } from '@/lib/actionsRegistery';
import { sceneState, actions } from '@/stores';

export const ActionPickerModal = () => {
  const snap = useSnapshot(sceneState);
  const [category, setCategory] = useState<ActionType | null>(null);

  const categories = [
    { id: 'motion', label: 'Motion', emoji: '🏃', color: '#22c55e' },
    { id: 'sound', label: 'Sound', emoji: '🔊', color: '#ef4444' },
    { id: 'particles', label: 'Particles', emoji: '🌧️', color: '#3b82f6' },
    // ... add more
  ];

  const handleAdd = (subType: string) => {
    if (!snap.selectedObjectId || !category) return;
    actions.addAction(snap.selectedObjectId, {
      id: crypto.randomUUID(),
      type: category,
      subType,
      trigger: 'onStart',
      config: ActionRegistry[subType]?.inputs.reduce(
        (acc, i) => ({ ...acc, [i.name]: i.default }),
        {}
      ),
    });
    actions.openActionPicker(false);
    setCategory(null);
  };

  return (
    <Dialog
      open={snap.actionPickerOpen}
      onOpenChange={actions.openActionPicker}
    >
      <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white p-6">
        <DialogHeader className="flex-row items-center gap-4 space-y-0">
          {category && (
            <ArrowLeft
              className="cursor-pointer"
              onClick={() => setCategory(null)}
            />
          )}
          <DialogTitle>
            {category ? category.toUpperCase() : 'Pick an action, any action'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {!category
            ? categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as ActionType)}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center gap-2 transition hover:scale-105"
                  style={{ backgroundColor: cat.color }}
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <span className="text-[10px] font-bold uppercase">
                    {cat.label}
                  </span>
                </button>
              ))
            : Object.entries(ActionRegistry)
                .filter(([_, v]) => v.category === category)
                .map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => handleAdd(key)}
                    className="aspect-square rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/10"
                  >
                    <span className="text-2xl">{val.icon}</span>
                    <span className="text-[10px] text-center px-1 leading-tight">
                      {val.label}
                    </span>
                  </button>
                ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
