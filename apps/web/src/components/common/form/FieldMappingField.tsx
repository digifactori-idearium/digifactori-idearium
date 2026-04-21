import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Control, Controller } from 'react-hook-form';

import { FormInputData, FieldMappingMeta } from './Input';

export interface FieldMappingFieldProps {
  control: Control<any>;
  input: FormInputData;
  fields: Record<string, FieldMappingMeta>;
}

export function FieldMappingField({
  control,
  input,
  fields,
}: FieldMappingFieldProps) {
  return (
    <Controller
      name={input.name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldMappingEditor
          value={field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
          fields={fields}
        />
      )}
    />
  );
}

interface FieldMappingEditorProps {
  value: Record<string, string> | undefined;
  onChange: (val: Record<string, string> | undefined) => void;
  error?: string;
  fields: Record<string, FieldMappingMeta>;
}

function FieldMappingEditor({
  value,
  onChange,
  error,
  fields,
}: FieldMappingEditorProps) {
  const [mapping, setMapping] = useState<Record<string, string>>(value ?? {});
  const [extras, setExtras] = useState<{ key: string; val: string }[]>([]);

  const requiredFields = Object.entries(fields).filter(([, m]) => m.required);
  const optionalFields = Object.entries(fields).filter(([, m]) => !m.required);

  useEffect(() => {
    const extraMap = Object.fromEntries(
      extras.filter(e => e.key).map(e => [e.key, e.val])
    );
    const merged = { ...mapping, ...extraMap };

    const filtered = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v.trim() !== '')
    );

    onChange(Object.keys(filtered).length ? filtered : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapping, extras]);

  const updateMapping = (key: string, val: string) => {
    setMapping(prev => ({ ...prev, [key]: val }));
  };

  const addExtra = () => setExtras(prev => [...prev, { key: '', val: '' }]);

  const updateExtra = (index: number, field: 'key' | 'val', val: string) => {
    setExtras(prev =>
      prev.map((e, i) => (i === index ? { ...e, [field]: val } : e))
    );
  };

  const removeExtra = (index: number) => {
    setExtras(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-4 flex flex-col gap-3">
        {requiredFields.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold">
              Champs requis
            </p>
            {requiredFields.map(([key, meta]) => (
              <FieldMappingRow
                key={key}
                label={meta.label}
                placeholder={meta.placeholder}
                required
                value={mapping[key] ?? ''}
                onChange={val => updateMapping(key, val)}
              />
            ))}
          </>
        )}

        {optionalFields.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold mt-2">
              Champs optionnels
            </p>
            {optionalFields.map(([key, meta]) => (
              <FieldMappingRow
                key={key}
                label={meta.label}
                placeholder={meta.placeholder}
                required={false}
                value={mapping[key] ?? ''}
                onChange={val => updateMapping(key, val)}
              />
            ))}
          </>
        )}

        {extras.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold mt-2">
              Champs personnalisés
            </p>
            {extras.map((extra, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nom du champ"
                  value={extra.key}
                  onChange={e => updateExtra(i, 'key', e.target.value)}
                  className="form-input flex-1 text-sm p-2!"
                />
                <span className="text-muted-foreground text-xs">→</span>
                <input
                  type="text"
                  placeholder="Champ API"
                  value={extra.val}
                  onChange={e => updateExtra(i, 'val', e.target.value)}
                  className="form-input flex-1 text-sm p-2!"
                />
                <button
                  type="button"
                  onClick={() => removeExtra(i)}
                  className="text-red-400 hover:text-red-300 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </>
        )}

        <button
          type="button"
          onClick={addExtra}
          className="mt-1 flex items-center gap-1.5 text-xs text-mauve hover:text-mauve/70 transition-colors self-start"
        >
          <Plus size={13} /> Ajouter un champ
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface FieldMappingRowProps {
  label: string;
  placeholder: string;
  required: boolean;
  value: string;
  onChange: (val: string) => void;
}

function FieldMappingRow({
  label,
  placeholder,
  required,
  value,
  onChange,
}: FieldMappingRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 shrink-0 flex items-center gap-1">
        <span className="text-xs font-medium text-foreground/80">{label}</span>
        {required && <span className="text-red-400 text-xs">*</span>}
      </div>
      <span className="text-muted-foreground text-xs shrink-0">→</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="form-input flex-1 text-sm p-2!"
      />
    </div>
  );
}
