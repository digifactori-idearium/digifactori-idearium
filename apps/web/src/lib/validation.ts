import { z } from 'zod';

import { FormInputData } from '@/components/common/form';

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
      schema = z.string().email('Adresse mail invalide');
      break;
    case 'password':
      schema = z
        .string()
        .min(6, 'Le mot de passe doit contenir au moins 6 caractères');
      break;
    case 'number':
      schema = z.preprocess(
        val => (val === '' ? undefined : Number(val)),
        z.number('Doit être un chiffre')
      );
      break;
    case 'select':
      schema = z
        .string()
        .min(1, `Veuillez sélectionner un ${input.label.toLowerCase()}`);
      break;
    default:
      schema = z.string();
  }

  // Handle Required logic
  if (input.required) {
    if (input.type !== 'number') {
      schema = (schema as z.ZodString).min(1, `${input.label} est requis`);
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

  const baseSchema = convertToZod(shape);

  return baseSchema.superRefine((data: any, ctx: z.RefinementCtx) => {
    const role = data.role || (data.user && data.user.role);
    const parentalCode =
      data.parental_code || (data.user && data.user.parental_code);

    if (role === 'CHILD') {
      const isEmpty = !parentalCode;
      const isPlaceholder = parentalCode === '****';
      const isTooShort = String(parentalCode).length < 4;

      if ((isEmpty || isTooShort) && !isPlaceholder) {
        ctx.addIssue({
          code: 'custom',
          message: 'Un code parental de 4 chiffres est requis pour les enfants',
          path: data.user ? ['user', 'parental_code'] : ['parental_code'],
        });
      }
    }
  });
};
