import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef } from 'react';
import { FieldValues, useForm, useWatch } from 'react-hook-form';
import { useSnapshot } from 'valtio';

import { FormInputRenderer } from './FormInputRenderer';
import { FormInputData } from './Input';

import { createFormSchema } from '@/lib/validation';
import { sceneState } from '@/stores';

interface ActionConfigFormProps {
  objectId: string;
  actionId: string;
  inputs: FormInputData[];
}

export function ActionConfigForm({
  objectId,
  actionId,
  inputs,
}: ActionConfigFormProps) {
  const snap = useSnapshot(sceneState.objects[objectId]);

  const action = snap.actions?.find(a => a.id === actionId);

  const currentConfig = action?.config || {};

  const formSchema = useMemo(() => createFormSchema(inputs), [inputs]);

  const {
    control,
    setValue,
    register,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: currentConfig as any,
    resolver: zodResolver(formSchema as any),
  });

  const isHydrating = useRef(true);
  const prevValues = useRef<any>(null);

  const watchedValues = useWatch({ control });

  useEffect(() => {
    if (!watchedValues || isHydrating.current) return;

    // prevent unnecessary updates
    if (JSON.stringify(prevValues.current) === JSON.stringify(watchedValues)) {
      return;
    }

    prevValues.current = watchedValues;

    const targetAction = sceneState.objects[objectId].actions?.find(
      a => a.id === actionId
    );

    if (targetAction) {
      targetAction.config = {
        ...targetAction.config,
        ...watchedValues,
      };
    }
  }, [watchedValues, objectId, actionId]);

  useEffect(() => {
    isHydrating.current = true;

    reset(currentConfig);

    prevValues.current = currentConfig;

    isHydrating.current = false;
  }, [currentConfig, reset]);

  return (
    <div className="w-full ideorama-form flex flex-col gap-4">
      {inputs.map(input => (
        <FormInputRenderer
          key={input.name}
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
