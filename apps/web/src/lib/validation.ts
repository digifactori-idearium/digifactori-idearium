import { z } from 'zod';

import { FormInputData } from '@/components/global/Input';

const setNestedObject = (obj: any, path: string, value: any) => {
  const keys = path.split('.');
  let current = obj;
  while (keys.length > 1) {
    const key = keys.shift()!;
    if (!(current[key] instanceof z.ZodObject)) {
      current[key] = current[key] || {};
    }
    current = current[key];
  }
  current[keys[0]] = value;
};

export const validation = (input: FormInputData) => {
  let schema: z.ZodTypeAny;

  switch (input.type) {
    case 'email':
      schema = z.string().email('Invalid email address');
      break;
    case 'password':
      schema = z.string().min(6, 'Password must be at least 6 characters');
      break;
    case 'number':
      schema = z.preprocess(
        val => (val === '' ? undefined : Number(val)),
        z.number('Must be a number')
      );
      break;
    case 'select':
      schema = z
        .string()
        .min(1, `Please select a ${input.label.toLowerCase()}`);
      break;
    default:
      schema = z.string();
  }

  // Handle Required logic
  if (input.required) {
    if (input.type !== 'number') {
      schema = (schema as z.ZodString).min(1, `${input.label} is required`);
    }
  } else {
    schema = schema.optional().or(z.literal(''));
  }

  return schema;
};

export const createFormSchema = (inputs: FormInputData[]) => {
  const shape: any = {};

  inputs.forEach(input => {
    const fieldSchema = validation(input);
    if (input.name.includes('.')) {
      setNestedObject(shape, input.name, fieldSchema);
    } else {
      shape[input.name] = fieldSchema;
    }
  });

  const convertToZod = (obj: any): any => {
    const newShape: any = {};
    for (const key in obj) {
      if (obj[key] instanceof z.ZodType) {
        newShape[key] = obj[key];
      } else {
        newShape[key] = convertToZod(obj[key]);
      }
    }
    return z.object(newShape);
  };

  return convertToZod(shape);
};
