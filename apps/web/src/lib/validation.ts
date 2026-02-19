import { z } from 'zod';

import { FormInputData } from '@/components/global/Input';

export const validation = (input: FormInputData) => {
  let schema: z.ZodTypeAny;

  switch (input.type) {
    case 'email':
      schema = z.string().email('Invalid email address');
      break;

    case 'password':
      schema = z.string().min(4, 'Password must be at least 4 characters');
      break;

    case 'number':
    case 'salary':
      schema = z
        .string()
        .refine(
          val => !isNaN(Number(val)) && val.trim() !== '',
          'Salary must be a number'
        );
      break;

    case 'tel':
      schema = z
        .string()
        .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format');
      break;

    case 'url':
      schema = z.string().url('Invalid URL format');
      break;

    case 'select':
    case 'radio':
      if (input.options) {
        schema = z
          .string()
          .refine(
            val => input.options?.some(opt => opt.value === val),
            `Please select a valid ${input.label.toLowerCase()}`
          );
      } else {
        schema = z.string();
      }
      break;

    case 'checkbox':
      schema = z.boolean().default(false);
      break;

    case 'textarea':
    default:
      schema = z.string();
  }

  if (input.required) {
    if (input.type === 'checkbox') {
      schema = (schema as z.ZodBoolean).refine(
        val => val === true,
        `${input.label} is required`
      );
    } else {
      schema = (schema as z.ZodString).min(1, `${input.label} is required`);
    }
  } else if (input.type !== 'checkbox') {
    schema = (schema as z.ZodString).optional().default('');
  }

  return schema;
};

export const createFormSchema = (inputs: FormInputData[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  inputs.forEach(input => {
    shape[input.name] = validation(input);
  });

  return z.object(shape);
};
