import { LucideProps, TriangleAlert } from 'lucide-react';
import React from 'react';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';

export interface FormInputData {
  label: string;
  type: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >;
  color?: string;
  options?: Option[];
}

export interface FormInputProps {
  input: FormInputData;
  id: number;
  register: UseFormRegister<FieldValues>;
  errors?: FieldErrors<FieldValues>;
}

const FormInput: React.FC<FormInputProps> = ({
  input,
  id,
  register,
  errors,
}) => {
  const errorMessages = errors && (errors[input.name]?.message as string);
  const hasError = !!errorMessages;

  const registerOptions = input.required ? { required: true } : {};

  // Render different input types
  const renderInput = () => {
    switch (input.type) {
      case 'textarea':
        return (
          <textarea
            id={`Input${id}`}
            rows={5}
            placeholder={input.placeholder}
            {...register(input.name, registerOptions)}
            className={`form-control form-input w-full pr-10 py-3${hasError ? 'error' : ''} ${input.icon ? 'pl-9' : ''}`}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={`Input${id}`}
              type="checkbox"
              {...register(input.name, registerOptions)}
              className={`form-checkbox relative peer shrink-0 cursor-pointer appearance-none rounded  checked:bg-[#6F51B0]! h-5 w-5 
                text-blue-600 bg-background! ${hasError ? 'error border-red-500' : 'border-background'}`}
            />
            <svg
              className="
                absolute 
                w-4 h-4 mt-1 ml-0.5
                hidden peer-checked:block pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <label
              htmlFor={`Input${id}`}
              className="ml-2 text-sm text-gray-700"
            >
              {input.placeholder || input.label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {input.options?.map((option, index) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${input.name}-${index}`}
                  type="radio"
                  value={option.value}
                  {...register(input.name, registerOptions)}
                  className={`form-radio appearance-none relative cursor-pointer peer shrink-0 rounded-full checked:bg-[#6F51B0]! h-5 w-5 text-blue-600 bg-background! ${hasError ? 'error border-red-500' : 'border-background'}`}
                />
                <svg
                  className="
                    absolute 
                    w-3 h-3 ml-1
                    hidden peer-checked:block pointer-events-none
                    fill-white
                  "
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 8 8"
                >
                  <circle cx="4" cy="4" r="4" />
                </svg>

                <label
                  htmlFor={`${input.name}-${index}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        );

      case 'checkbox-group':
        return (
          <div className="space-y-2">
            {input.options?.map((option, index) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${input.name}-${index}`}
                  type="checkbox"
                  value={option.value}
                  {...register(
                    `${input.name}.${option.value}`,
                    registerOptions
                  )}
                  className={`form-checkbox relative cursor-pointer peer shrink-0 appearance-none rounded checked:bg-[#6F51B0]! h-5 w-5
                     text-blue-600 bg-background! ${hasError ? 'error border-red-500' : 'border-background'}`}
                />
                <svg
                  className="
                    absolute 
                    w-4 h-4 mt-1 ml-0.5
                    hidden peer-checked:block pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <label
                  htmlFor={`${input.name}-${index}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            id={`Input${id}`}
            type={input.type}
            placeholder={input.placeholder}
            {...register(input.name, registerOptions)}
            className={`form-control form-input py-3! ${hasError ? 'error' : ''} ${input.icon ? 'pl-9' : ''}`}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`Input${id}`}>
        <b>{input.label}</b>
        {input.required && <span className=" text-red-600">*</span>}
      </label>
      <div className="relative flex items-center gap-2">
        {input.icon && (
          <div className="form-icon">
            <input.icon size={30} className=" text-white" />
          </div>
        )}

        {renderInput()}
      </div>
      {hasError && (
        <span className="text-red-600 flex gap-2">
          <TriangleAlert className="inline-block" />
          {errorMessages}
        </span>
      )}
    </div>
  );
};

export default FormInput;
