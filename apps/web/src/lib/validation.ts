import { z } from 'zod';

import { FormInputData } from '@/components/common/form';

function makeOptional(schema: z.ZodTypeAny): z.ZodTypeAny {
  return z.preprocess(
    val => (val === '' || val === null || val === undefined ? undefined : val),
    schema.optional()
  );
}

const setNestedObject = (obj: any, path: string, value: any) => {
  const keys = path.split('.');
  let current = obj;
  while (keys.length > 1) {
    const key = keys.shift()!;
    current[key] = current[key] ?? {};
    current = current[key];
  }
  current[keys[0]] = value;
};

export const validation = (input: FormInputData): z.ZodTypeAny => {
  let schema: z.ZodTypeAny;

  switch (input.type) {
    //  String types
    case 'email':
      schema = z.email('Adresse mail invalide');
      break;

    case 'password': {
      const maxLen = (input as any).max;
      const minLen = (input as any).min ?? (maxLen !== undefined ? maxLen : 6);
      let s = z
        .string()
        .min(
          minLen,
          `Doit contenir au moins ${minLen} caractère${minLen > 1 ? 's' : ''}`
        );
      if (maxLen) {
        s = s.max(maxLen, `Maximum ${maxLen} caractères`);
      }
      schema = s;
      break;
    }

    case 'select':
      schema = z
        .string()
        .min(1, `Veuillez sélectionner ${input.label.toLowerCase()}`);
      break;

    case 'textarea':
    case 'text':
      schema = z.string();
      break;

    case 'color':
    case 'emoji':
      schema = z.string();
      break;

    // Numeric types
    case 'number':
    case 'slider':
      schema = z.preprocess(
        val => (val === '' || val === null ? undefined : Number(val)),
        z.number({ message: 'Doit être un nombre' })
      );
      break;

    // Boolean
    case 'switch':
      return z.boolean().default(false);

    // Structured
    case 'vector3':
      schema = z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      });
      break;

    case 'fieldMapping':
      schema = z.record(z.string(), z.string());
      break;

    // Passthrough
    case 'file':
    case 'image':
    case 'dialog':
    default:
      schema = z.any();
      break;
  }

  //  Required / optional handling
  if (input.required) {
    const stringLike = [
      'email',
      'password',
      'select',
      'text',
      'textarea',
      'color',
      'emoji',
    ];
    if (stringLike.includes(input.type)) {
      schema = (schema as z.ZodString).min(1, `${input.label} est requis`);
    }
    return schema;
  }

  return makeOptional(schema);
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

  const convertToZod = (obj: any): z.ZodObject<any> => {
    const newShape: any = {};
    for (const key in obj) {
      newShape[key] =
        obj[key] instanceof z.ZodType ? obj[key] : convertToZod(obj[key]);
    }
    return z.object(newShape);
  };

  return convertToZod(shape);
};
