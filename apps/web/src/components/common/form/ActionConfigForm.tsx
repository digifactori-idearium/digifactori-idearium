import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef } from 'react';
import { FieldValues, useForm, useWatch } from 'react-hook-form';
import { useSnapshot } from 'valtio';

import { FormInputRenderer } from './FormInputRenderer';
import { FormInputData } from './Input';

import { createFormSchema } from '@/lib/validation';
import { actions, sceneState } from '@/stores';

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
  const prevValuesRef = useRef<Record<string, any>>({});

  const watchedValues = useWatch({ control });

  useEffect(() => {
    if (!watchedValues || isHydrating.current) return;

    const obj = sceneState.objects[objectId];
    const targetAction = obj?.actions?.find(a => a.id === actionId);
    if (!targetAction) return;

    let changed = false;
    for (const key in watchedValues) {
      if (watchedValues[key] !== prevValuesRef.current[key]) {
        changed = true;
        break;
      }
    }
    if (!changed) return;

    prevValuesRef.current = { ...watchedValues };

    Object.assign(targetAction.config, watchedValues);

    actions.bumpActionsVersion(objectId);
  }, [watchedValues, objectId, actionId]);

  useEffect(() => {
    isHydrating.current = true;
    reset(currentConfig);
    prevValuesRef.current = { ...currentConfig };
    isHydrating.current = false;
  }, [actionId]);

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
