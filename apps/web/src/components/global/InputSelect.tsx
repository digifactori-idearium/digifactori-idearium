import { LucideProps, TriangleAlert } from 'lucide-react';
import * as React from 'react';

import { Field, FieldGroup } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InputSelectProps {
  placeholder?: string;
  options: Option[];
  value?: string;
  name: string;
  error?: string;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >;
  onChange?: (value: string) => void;
  className?: string;
}

export default function InputSelect({
  options,
  placeholder = 'Select an option',
  onChange,
  value,
  error,
  icon,
  className = '',
}: InputSelectProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full flex items-center gap-2">
        {icon && (
          <div className="form-icon">
            {React.createElement(icon, { size: 30, className: 'text-white' })}
          </div>
        )}
        <FieldGroup className={`w-full`}>
          <Field>
            <Select value={value || ''} onValueChange={val => onChange?.(val)}>
              <SelectTrigger
                className={`w-full relative bg-sidebar! form-select form-input rounded-2xl! p-6! ${className} ${error ? 'error' : ''}`}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>

              <SelectContent position="popper">
                <SelectGroup>
                  {options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.text}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </div>

      {error && (
        <span className="text-red-600 flex gap-2">
          <TriangleAlert className="inline-block" />
          {error}
        </span>
      )}
    </div>
  );
}
