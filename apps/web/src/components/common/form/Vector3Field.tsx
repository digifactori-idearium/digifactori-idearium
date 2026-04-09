import { Controller, Control } from 'react-hook-form';

import { FormInputData } from './Input';

import { Input } from '@/components/ui/input';

interface Vector3FieldProps {
  input: FormInputData;
  control: Control<any>;
}

export function Vector3Field({ input, control }: Vector3FieldProps) {
  const step = input.step ?? 1;

  const axisColors: Record<string, string> = {
    x: 'text-red-500',
    y: 'text-emerald-500',
    z: 'text-blue-500',
  };

  return (
    <div className="form-input-container flex flex-col gap-1.5">
      <label className="text-sm font-medium">{input.label}</label>

      <div className="flex gap-2">
        {(['x', 'y', 'z'] as const).map(axis => (
          <Controller
            key={axis}
            name={`${input.name}.${axis}`}
            control={control}
            render={({ field }) => (
              <div className="flex flex-1 items-center bg-sidebar-dark/30 border border-white/10 rounded-lg overflow-hidden">
                <span
                  className={`text-[11px] font-bold! pl-2 pr-1 uppercase ${axisColors[axis]}`}
                >
                  {axis}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    field.onChange(
                      Number(((field.value ?? 0) - step).toFixed(2))
                    )
                  }
                  className="px-1.5 py-1.5 text-base leading-none text-muted-foreground rounded-md hover:bg-white/10 transition-colors"
                >
                  -
                </button>

                <Input
                  type="number"
                  step={step}
                  value={field.value ?? 0}
                  onChange={e =>
                    field.onChange(
                      e.target.value === '' ? 0 : Number(e.target.value)
                    )
                  }
                  className="w-11 text-center text-sm font-medium border-none bg-transparent! shadow-none p-0! no-spinner focus-visible:ring-0!"
                />

                <button
                  type="button"
                  onClick={() =>
                    field.onChange(
                      Number(((field.value ?? 0) + step).toFixed(2))
                    )
                  }
                  className="px-1.5 py-1.5  text-base leading-none text-muted-foreground rounded-md hover:bg-white/10 transition-colors"
                >
                  +
                </button>
              </div>
            )}
          />
        ))}
      </div>
    </div>
  );
}
