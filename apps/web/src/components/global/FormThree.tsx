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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const snap = useSnapshot(sceneState.objects[objectId]);
    return snap[sliceKey as keyof typeof snap];
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const snap = useSnapshot((sceneState as any)[sliceKey]);
  return snap;
}

export function FormThree({ inputs, sliceKey, objectId }: FormThreeProps) {
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
    if (watcher.current) {
      watcher.current = false;
      return;
    }
    Object.entries(currentState as Record<string, any>).forEach(
      ([key, val]) => {
        setValue(key, val, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    );
  }, [currentState, setValue]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const watchedValues = useWatch({ control });

  useEffect(() => {
    if (!watchedValues) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      watcher.current = true;
      actions.updateSlice(sliceKey, watchedValues, objectId);
    }, 50);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watchedValues, sliceKey, objectId]);

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
