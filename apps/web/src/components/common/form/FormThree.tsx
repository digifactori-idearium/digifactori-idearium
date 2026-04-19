/* eslint-disable react-hooks/rules-of-hooks */
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef } from 'react';
import { FieldValues, useForm, useWatch } from 'react-hook-form';
import { useSnapshot } from 'valtio';

import { FormInputRenderer } from './FormInputRenderer';
import { FormInputData } from './Input';

import { createFormSchema } from '@/lib/validation';
import { sceneState, actions } from '@/stores';

interface FormThreeProps {
  inputs: FormInputData[];
  sliceKey: ObjectSliceKey | RootSliceKey;
  objectId?: string | null;
}

function useSliceSnapshot(
  sliceKey: ObjectSliceKey | RootSliceKey,
  objectId?: string | null
) {
  if (objectId) {
    const obj = sceneState.objects?.[objectId];

    if (!obj) return {};

    const snap = useSnapshot(obj);

    const slice = snap[sliceKey as keyof typeof snap];

    return slice ?? {};
  }

  const rootSlice = (sceneState as any)?.[sliceKey];

  if (!rootSlice) return {};

  const snap = useSnapshot(rootSlice);

  return snap ?? {};
}

export function FormThree({ inputs, sliceKey, objectId }: FormThreeProps) {
  if (!inputs || !Array.isArray(inputs)) {
    console.warn('FormThree: inputs is missing or not an array');
    return null;
  }

  const currentState = useSliceSnapshot(sliceKey, objectId);
  const formSchema = useMemo(() => createFormSchema(inputs), [inputs]);

  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: currentState as any,
    resolver: zodResolver(formSchema as any),
  });

  const watcher = useRef(false);

  useEffect(() => {
    if (!currentState || typeof currentState !== 'object') return;

    if (watcher.current) {
      watcher.current = false;
      return;
    }

    const entries = Object.entries(currentState as Record<string, any>);
    if (!entries.length) return;

    entries.forEach(([key, val]) => {
      if (key && setValue) {
        setValue(key, val, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    });
  }, [currentState, setValue]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const watchedValues = useWatch({ control });

  useEffect(() => {
    if (!watchedValues) return;

    if (!actions || typeof actions.updateSlice !== 'function') {
      console.warn('FormThree: actions.updateSlice is not available');
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        watcher.current = true;
        actions.updateSlice(sliceKey, watchedValues, objectId);
      } catch (error) {
        console.error('FormThree: Error updating slice', error);
      }
    }, 50);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [watchedValues, sliceKey, objectId]);

  if (!inputs.length) {
    return null;
  }

  return (
    <div className="w-full ideorama-form flex flex-col gap-2">
      {inputs.map((input, index) => (
        <FormInputRenderer
          key={index}
          input={input as any}
          control={control}
          setValue={setValue}
          register={register}
          errors={errors}
        />
      ))}
    </div>
  );
}
