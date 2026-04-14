import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Highlighter,
  Palette,
  Type,
} from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { createPortal } from 'react-dom';

import { FONT_SIZES } from '@/lib/editor';

// Toolbar button
interface ToolbarButtonProps {
  onMouseDown: (e: React.MouseEvent) => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onMouseDown,
  active,
  title,
  disabled,
  children,
}) => (
  <button
    type="button"
    onMouseDown={onMouseDown}
    disabled={disabled}
    title={title}
    aria-label={title}
    className={`
      flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 text-sm select-none
      ${
        active
          ? 'bg-violet-500 text-white shadow-md shadow-violet-300 scale-95'
          : 'text-slate-600 hover:bg-violet-100 hover:text-violet-700'
      }
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />;

//  Color picker portal
interface ColorPickerPortalProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
  triggerRect: DOMRect;
}

const ColorPickerPortal: React.FC<ColorPickerPortalProps> = ({
  color,
  onChange,
  onClose,
  triggerRect,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const id = setTimeout(
      () => document.addEventListener('mousedown', handler),
      0
    );
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  const top = triggerRect.bottom + window.scrollY + 6;
  const left = triggerRect.left + window.scrollX;

  return createPortal(
    <div
      ref={ref}
      style={{ position: 'absolute', top, left, zIndex: 99999 }}
      className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 flex flex-col gap-2"
      onMouseDown={e => e.preventDefault()}
    >
      <HexColorPicker color={color} onChange={onChange} />
      {/* Hex input */}
      <input
        type="text"
        value={color.toUpperCase()}
        maxLength={7}
        onChange={e => {
          let v = e.target.value.toUpperCase();
          if (!v.startsWith('#')) v = '#' + v.replace('#', '');
          if (/^#[0-9A-F]{0,6}$/.test(v)) onChange(v);
        }}
        className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-300 uppercase text-slate-600"
      />
    </div>,
    document.body
  );
};

//  Color picker trigger
interface ColorPickerProps {
  icon: React.ReactNode;
  title: string;
  currentColor: string;
  onSelect: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  icon,
  title,
  currentColor,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // preserve editor selection
    if (!open && btnRef.current) {
      setRect(btnRef.current.getBoundingClientRect());
    }
    setOpen(p => !p);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onMouseDown={handleMouseDown}
        title={title}
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 text-slate-600 hover:bg-violet-100 hover:text-violet-700 cursor-pointer select-none relative"
      >
        {icon}
        <span
          className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white"
          style={{ background: currentColor }}
        />
      </button>

      {open && rect && (
        <ColorPickerPortal
          color={currentColor}
          onChange={onSelect}
          onClose={() => setOpen(false)}
          triggerRect={rect}
        />
      )}
    </>
  );
};

//  Main toolbar
interface EditorToolbarProps {
  editor: Editor;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const [textColor, setTextColor] = useState('#1e1b4b');
  const [highlightColor, setHighlightColor] = useState('#fef08a');

  const cmd = (e: React.MouseEvent, fn: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  const applyTextColor = (color: string) => {
    setTextColor(color);
    editor.chain().focus().setColor(color).run();
  };

  const applyHighlight = (color: string) => {
    setHighlightColor(color);
    editor.chain().focus().toggleHighlight({ color }).run();
  };

  const editorFocus = () =>
    editor.chain().focus(undefined, { scrollIntoView: false });

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-white/80 backdrop-blur-sm border-b border-slate-100"
      style={{ position: 'relative', zIndex: 50 }}
    >
      {/* History */}
      <ToolbarButton
        onMouseDown={e => cmd(e, () => editor.chain().undo().run())}
        disabled={!editor.can().undo()}
        title="Annuler"
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onMouseDown={e => cmd(e, () => editor.chain().redo().run())}
        disabled={!editor.can().redo()}
        title="Rétablir"
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <ToolbarButton
        onMouseDown={e =>
          cmd(e, () => editor.chain().toggleHeading({ level: 1 }).run())
        }
        active={editor.isActive('heading', { level: 1 })}
        title="Grand titre"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onMouseDown={e =>
          cmd(e, () => editor.chain().toggleHeading({ level: 2 }).run())
        }
        active={editor.isActive('heading', { level: 2 })}
        title="Sous-titre"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* Formatting */}
      <ToolbarButton
        onMouseDown={e => cmd(e, () => editor.chain().toggleBold().run())}
        active={editor.isActive('bold')}
        title="Gras"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onMouseDown={e => cmd(e, () => editor.chain().toggleItalic().run())}
        active={editor.isActive('italic')}
        title="Italique"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onMouseDown={e => cmd(e, () => editor.chain().toggleUnderline().run())}
        active={editor.isActive('underline')}
        title="Souligner"
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onMouseDown={e => cmd(e, () => editor.chain().toggleStrike().run())}
        active={editor.isActive('strike')}
        title="Barrer"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* Text color */}
      <ColorPicker
        icon={<Palette className="w-4 h-4" />}
        title="Couleur du texte"
        currentColor={textColor}
        onSelect={applyTextColor}
      />

      {/* Highlight color */}
      <ColorPicker
        icon={<Highlighter className="w-4 h-4" />}
        title="Surligner"
        currentColor={highlightColor}
        onSelect={applyHighlight}
      />

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onMouseDown={e => cmd(e, () => editor.chain().toggleBulletList().run())}
        active={editor.isActive('bulletList')}
        title="Liste à puces"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onMouseDown={e =>
          cmd(e, () => editor.chain().toggleOrderedList().run())
        }
        active={editor.isActive('orderedList')}
        title="Liste numérotée"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <ToolbarButton
        onMouseDown={e =>
          cmd(e, () => editor.chain().setTextAlign('left').run())
        }
        active={editor.isActive({ textAlign: 'left' })}
        title="Aligner à gauche"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onMouseDown={e =>
          cmd(e, () => editor.chain().setTextAlign('center').run())
        }
        active={editor.isActive({ textAlign: 'center' })}
        title="Centrer"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onMouseDown={e =>
          cmd(e, () => editor.chain().setTextAlign('right').run())
        }
        active={editor.isActive({ textAlign: 'right' })}
        title="Aligner à droite"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* Font size */}
      <div className="flex items-center gap-1">
        <Type className="w-3.5 h-3.5 text-slate-400" />
        <select
          onMouseDown={e => e.stopPropagation()}
          onChange={e => {
            editor
              .chain()
              .focus()
              .setMark('textStyle', { fontSize: e.target.value })
              .run();
          }}
          defaultValue="1.25rem"
          className="text-xs border border-slate-200 rounded-lg px-1.5 py-1 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-300"
        >
          {FONT_SIZES.map(f => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
