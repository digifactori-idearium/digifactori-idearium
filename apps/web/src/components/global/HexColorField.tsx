import { HexColorPicker } from 'react-colorful';
import { Controller, Control } from 'react-hook-form';

import { FormInputData } from './Input';

import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface HexColorFieldProps {
  input: FormInputData;
  control: Control<any>;
}

export function HexColorField({ input, control }: HexColorFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{input.label}</label>

      <Controller
        name={input.name}
        control={control}
        render={({ field }) => {
          const value: string = field.value || '#000000';

          const handleInputChange = (raw: string) => {
            let val = raw.toUpperCase();

            if (!val.startsWith('#')) {
              val = '#' + val.replace('#', '');
            }

            if (/^#[0-9A-F]{0,6}$/.test(val)) {
              field.onChange(val);
            }
          };

          return (
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-md border shadow-sm"
                    style={{ backgroundColor: value }}
                  />
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto p-3 flex flex-col gap-3"
                  align="start"
                >
                  <HexColorPicker color={value} onChange={field.onChange} />

                  <Input
                    value={value}
                    maxLength={7}
                    onChange={e => handleInputChange(e.target.value)}
                    className="text-sm font-mono uppercase h-8"
                  />
                </PopoverContent>
              </Popover>

              <Input
                value={value}
                maxLength={7}
                onChange={e => handleInputChange(e.target.value)}
                className="w-28! h-8 text-sm font-mono uppercase form-input"
              />
            </div>
          );
        }}
      />
    </div>
  );
}
