import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useSnapshot } from 'valtio';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ActionRegistry } from '@/lib/actions/registery';
import { sceneState, actions } from '@/stores';

export const ActionPickerModal = () => {
  const snap = useSnapshot(sceneState);
  const [category, setCategory] = useState<ActionType | null>(null);

  const categories = [
    { id: 'motion', label: 'Mouvement', emoji: '🏃', color: '#22c55e' },
    { id: 'appearance', label: 'Apparence', emoji: '🎨', color: '#3b82f6' },
    { id: 'say', label: 'Parole', emoji: '💬', color: '#f59e0b' },
    { id: 'sound', label: 'Son', emoji: '🔊', color: '#ef4444' },
    { id: 'particles', label: 'Effets', emoji: '💫', color: '#14b8a6' },
    { id: 'utility', label: 'Utilité', emoji: '⏱️', color: '#ff66ce' },
  ];

  const handleAdd = (subType: string) => {
    if (!snap.selectedObjectId || !category) return;
    actions.addAction(snap.selectedObjectId, {
      id: crypto.randomUUID(),
      type: category,
      active: true,
      subType,
      trigger: snap.pendingTrigger,
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
      <DialogContent className="relativesm:max-w-md bg-zinc-950 border-white/10 text-white p-6 z-60!">
        <DialogHeader className="flex-row items-center gap-4 space-y-0">
          {category && (
            <ArrowLeft
              className="cursor-pointer"
              onClick={() => setCategory(null)}
            />
          )}
          <DialogTitle>
            {category
              ? categories.find(c => c.id === category)?.label
              : "Choisis une action, n'importe laquelle"}
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
