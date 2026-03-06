import { zodResolver } from '@hookform/resolvers/zod';
import { SquareArrowOutUpRight } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Controller, FieldValues, useForm, useWatch } from 'react-hook-form';
import { useSnapshot } from 'valtio';

import { Slider } from '../ui/slider';

import { HexColorField } from './HexColorField';
import FormInput, { FormInputData } from './Input';
import InputSelect from './InputSelect';
import UploadField from './UploadField';
import { Vector3Field } from './Vector3Field';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
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
      {inputs.map((input, index) => {
        // IMAGE / FILE
        if (input.type === 'file' || input.type === 'image') {
          return (
            <div key={index} className="flex flex-col gap-2">
              <label className="text-sm font-medium">{input.label}</label>
              <Controller
                name={input.name}
                control={control}
                render={({ field }) => (
                  <UploadField
                    type={input.type}
                    name={field.name}
                    setValue={setValue}
                    placeholder={input.placeholder}
                    error={errors[input.name]?.message as string}
                  />
                )}
              />
            </div>
          );
        }

        // SELECT
        if (input.type === 'select') {
          return (
            <div
              key={index}
              className="form-input-container flex flex-col gap-2"
            >
              <label className="text-sm font-medium">{input.label}</label>
              <Controller
                name={input.name}
                control={control}
                render={({ field }) => (
                  <InputSelect
                    {...field}
                    name={input.name}
                    error={errors[input.name]?.message as string}
                    options={input.options || []}
                    placeholder={input.placeholder}
                    onChange={val => field.onChange(val)}
                    icon={input.icon}
                  />
                )}
              />
            </div>
          );
        }

        // SWITCH
        if (input.type === 'switch') {
          return (
            <div key={index} className="flex items-center justify-between">
              <label className="text-sm font-medium">{input.label}</label>
              <Controller
                name={input.name}
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id={input.name}
                    className="bg-zinc-800! data-[state=checked]:bg-mauve! border! border-zinc-700!"
                  />
                )}
              />
            </div>
          );
        }

        // VECTOR3
        if (input.type === 'vector3') {
          return (
            <div key={index}>
              <Vector3Field control={control} input={input} />
            </div>
          );
        }

        // COLOR
        if (input.type === 'color') {
          return (
            <div key={index}>
              <HexColorField control={control} input={input} />
            </div>
          );
        }

        // SLIDER
        if (input.type === 'slider') {
          return (
            <div
              key={index}
              className="flex items-center gap-2 justify-between"
            >
              <label className="text-sm font-medium">{input.label}</label>
              <Controller
                name={input.name}
                control={control}
                render={({ field }) => (
                  <div className="flex w-full items-center gap-2">
                    <input
                      type="number"
                      value={field.value}
                      min={input.min ?? 0}
                      max={input.max ?? 10}
                      step={input.step ?? 0.1}
                      onChange={e => field.onChange(Number(e.target.value))}
                      className="slider-input w-12 text-xs"
                    />
                    <Slider
                      min={input.min ?? 0}
                      max={input.max ?? 10}
                      step={input.step ?? 0.1}
                      value={[field.value ?? 0]}
                      onValueChange={val => field.onChange(val[0])}
                      className="flex-1 py-4 cursor-pointer"
                    />
                  </div>
                )}
              />
            </div>
          );
        }

        // DIALOG
        if (input.type === 'dialog') {
          return (
            <div
              key={index}
              className="form-input-container flex flex-col gap-2"
            >
              <label className="text-sm font-medium">{input.label}</label>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="px-3 py-1 flex justify-between items-center form-input bg-transparent! text-muted-foreground!"
                  >
                    <span>Choisir {input.label}</span>
                    <SquareArrowOutUpRight size={16} />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg bg-sidebar">
                  <DialogHeader>
                    <DialogTitle>Configuration {input.label}</DialogTitle>
                    <DialogDescription>
                      Personnalisez les réglages ci-dessous.
                    </DialogDescription>
                  </DialogHeader>
                  {input.dialogueContent || 'Nothing to display'}
                </DialogContent>
              </Dialog>
            </div>
          );
        }

        // DEFAULT TEXT INPUT
        return (
          <FormInput
            key={index}
            input={input}
            id={index + 1}
            register={register}
            errors={errors}
          />
        );
      })}
    </div>
  );
}
