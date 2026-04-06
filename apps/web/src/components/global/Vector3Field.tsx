import { ChevronUp, ChevronDown } from 'lucide-react';
import { Controller, Control } from 'react-hook-form';

import { FormInputData } from './Input';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Vector3FieldProps {
  input: FormInputData;
  control: Control<any>;
}

export function Vector3Field({ input, control }: Vector3FieldProps) {
  const step = input.step ?? 1;

  return (
    <div className="form-input-container flex flex-col gap-2">
      <label className="text-sm font-medium">{input.label}</label>

      <div className="grid grid-cols-3 gap-3">
        {['x', 'y', 'z'].map(axis => (
          <Controller
            key={axis}
            name={`${input.name}.${axis}`}
            control={control}
            render={({ field }) => (
              <div className="flex flex-col items-center bg-sidebar-dark/30 rounded-xl p-2 gap-1">
                <Button
                  type="button"
                  size="icon"
                  className="h-5 w-5 flex justify-center items-center main-btn"
                  onClick={() =>
                    field.onChange(
                      Number(((field.value ?? 0) + step).toFixed(2))
                    )
                  }
                >
                  <ChevronUp className="w-3! h-3!" />
                </Button>

                <Input
                  type="number"
                  step={step}
                  // min={input.min}
                  // max={input.max}
                  maxLength={4}
                  value={field.value ?? 0}
                  onChange={e =>
                    field.onChange(
                      e.target.value === '' ? 0 : Number(e.target.value)
                    )
                  }
                  className="text-center h-5 p-0 bg-transparent border-none shadow-none no-spinner focus-visible:ring-0!"
                />

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 flex justify-center items-center main-btn"
                  onClick={() =>
                    field.onChange(
                      Number(((field.value ?? 0) - step).toFixed(2))
                    )
                  }
                >
                  <ChevronDown className="w-3! h-3!" />
                </Button>

                <span className="text-[10px] font-bold text-white uppercase">
                  {axis}
                </span>
              </div>
            )}
          />
        ))}
      </div>
    </div>
  );
}
