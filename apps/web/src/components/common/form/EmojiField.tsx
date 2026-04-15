import { useState } from 'react';
import { Controller, Control, FieldValues } from 'react-hook-form';

import { FormInputData } from './Input';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ── Emoji Data ─────────────────────────────────────────
const CATEGORIES = [
  {
    label: 'Faces',
    icon: '😄',
    emojis: [
      '😀',
      '😃',
      '😄',
      '😁',
      '😆',
      '🤣',
      '😅',
      '😊',
      '😇',
      '🥰',
      '😍',
      '🤩',
      '😘',
      '😗',
      '😙',
      '😚',
      '🙂',
      '🤗',
      '🤭',
      '😋',
      '😛',
      '😜',
      '🤪',
      '😝',
      '🤑',
      '😎',
      '🥳',
      '🤓',
      '🧐',
      '😏',
    ],
  },
  {
    label: 'Animals',
    icon: '🐶',
    emojis: [
      '🐶',
      '🐱',
      '🐭',
      '🐹',
      '🐰',
      '🦊',
      '🐻',
      '🐼',
      '🐨',
      '🐯',
      '🦁',
      '🐮',
      '🐷',
      '🐸',
      '🐵',
      '🐔',
      '🐧',
      '🐦',
      '🦄',
      '🐙',
      '🦋',
      '🐠',
      '🐬',
      '🦒',
      '🦓',
      '🦏',
      '🦘',
      '🦙',
      '🦌',
      '🐿️',
      '🦛',
    ],
  },
  {
    label: 'Food',
    icon: '🍕',
    emojis: [
      '🍕',
      '🍔',
      '🌮',
      '🍟',
      '🌭',
      '🍿',
      '🧁',
      '🎂',
      '🍰',
      '🍩',
      '🍪',
      '🍦',
      '🍧',
      '🍨',
      '🍡',
      '🍭',
      '🍬',
      '🍫',
      '🍯',
      '🍎',
      '🍓',
      '🍇',
      '🍉',
      '🍊',
      '🍋',
      '🍌',
      '🍍',
      '🥭',
      '🍑',
      '🍒',
    ],
  },
  {
    label: 'Sports',
    icon: '⚽',
    emojis: [
      '⚽',
      '🏀',
      '🏈',
      '⚾',
      '🎾',
      '🏐',
      '🏉',
      '🎱',
      '🏓',
      '🏸',
      '🥊',
      '🥋',
      '🎯',
      '🛹',
      '🛼',
      '🎿',
      '⛷️',
      '🏂',
      '🏋️',
      '🤸',
      '🤼',
      '🤺',
      '🏇',
      '🧘',
      '🏊',
      '🚴',
      '🤾',
      '🎪',
      '🎠',
      '🎡',
    ],
  },
  {
    label: 'Nature',
    icon: '🌈',
    emojis: [
      '🌈',
      '⭐',
      '🌟',
      '💫',
      '✨',
      '🌙',
      '☀️',
      '🌤️',
      '⛅',
      '🌦️',
      '🌊',
      '🌺',
      '🌸',
      '🌼',
      '🌻',
      '🌹',
      '🍀',
      '🌿',
      '🌵',
      '🌴',
      '🍄',
      '🪐',
      '🌍',
      '🔥',
      '❄️',
      '⚡',
      '🌪️',
      '🦋',
    ],
  },
];

// ── Emoji Picker ───────────────────────────────────────
function EmojiPickerPopover({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState('0');
  const [hovered, setHovered] = useState<string | null>(null);

  const current = CATEGORIES[Number(activeCategory)];

  return (
    <Popover>
      {/* Trigger */}
      <PopoverTrigger asChild className="py-2! h-fit">
        <Button
          variant="outline"
          className="emoji-trigger bg-sidebar w-full justify-start"
        >
          <span className="emoji-trigger-icon">{value || '😀'}</span>
          <span className="emoji-trigger-label">
            {value ? "Changer d'émoji" : 'Choisis un emoji !'}
          </span>
        </Button>
      </PopoverTrigger>

      {/* Content */}
      <PopoverContent
        className="emoji-popover bg-sidebar w-[320px] p-3 z-110"
        align="center"
        side="bottom"
      >
        {/* Decorative bubbles */}
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />

        {/* Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="emoji-tabs w-full">
            {CATEGORIES.map((cat, i) => (
              <TabsTrigger
                key={cat.label}
                value={String(i)}
                className="emoji-tab"
              >
                {cat.icon}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Label */}
        <div className="emoji-category-label mt-2">
          {current.icon} {current.label}
        </div>

        {/* Grid */}
        <ScrollArea className="h-30 mt-2 pr-2">
          <div className="emoji-grid">
            {current.emojis.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => onChange(emoji)}
                onMouseEnter={() => setHovered(emoji)}
                onMouseLeave={() => setHovered(null)}
                className={`emoji-btn ${
                  hovered === emoji ? 'hovered' : ''
                } ${value === emoji ? 'selected' : ''}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Preview */}
        <div className="emoji-preview mt-2">
          {hovered ? (
            <>
              <span className="preview-big">{hovered}</span>
              <span className="preview-hint">Clic pour sélectionner !</span>
            </>
          ) : value ? (
            <>
              <span className="preview-big">{value}</span>
              <span className="preview-hint">Ton choix ✓</span>
            </>
          ) : (
            <span className="preview-hint">
              Placez ton curseur sur un emoji pour avoir un aperçu 👀
            </span>
          )}
        </div>
      </PopoverContent>

      {/* Styles */}
      <style>{`
        .emoji-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 16px;
          border: 2.5px dashed #a78bfa;
          color: white;
        }
        .emoji-trigger-icon { font-size: 1.8rem; }
        .emoji-trigger-label { flex: 1; font-size: 0.85rem; color: #c4b5fd; }

        .emoji-popover {
          border-radius: 20px;
          border: 2px solid #6d28d9;
          box-shadow: 0 8px 40px rgba(109,40,217,0.5);
        }

        .emoji-tabs {
          display: flex;
          gap: 4px;
          padding: 6px;
          background: rgba(255,255,255,0.04) !important;
          border-radius: 12px;
        }

        .emoji-tab.active {
          background: linear-gradient(135deg, #7c3aed, #ec4899);
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
        }

        .emoji-btn {
          font-size: 1.3rem;
          border-radius: 8px;
          padding: 4px;
        }

        .emoji-btn.hovered {
          transform: scale(1.25);
          background: rgba(167,139,250,0.2);
        }

        .emoji-btn.selected {
          background: rgba(124,58,237,0.4);
        }

        .emoji-preview {
          display: flex;
          gap: 8px;
          padding: 6px;
        }

        .preview-big { font-size: 1.4rem; }
      `}</style>
    </Popover>
  );
}

// ── Field Wrapper ──────────────────────────────────────
interface EmojiPickerFieldProps {
  control: Control<FieldValues>;
  input: FormInputData;
}

export function EmojiPickerField({ control, input }: EmojiPickerFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{input.label}</label>

      <Controller
        name={input.name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <EmojiPickerPopover value={field.value} onChange={field.onChange} />
        )}
      />
    </div>
  );
}
