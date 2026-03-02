import { zodResolver } from '@hookform/resolvers/zod';
import { isEqual } from 'lodash';
import { SquareArrowOutUpRight } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Controller, FieldValues, useForm, useWatch } from 'react-hook-form';
import { StoreApi, UseBoundStore } from 'zustand';

import { Slider } from '../ui/slider';

import { HexColorField } from './HexColorField';
import FormInput, { FormInputData } from './Input';
import InputSelect from './InputSelect';
import UploadField from './UploadField';
import { Vector3Field } from './Vector3Field';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { createFormSchema } from '@/lib/validation';

interface FormThreeProps<
  T extends { update: (path: any, values: any) => void },
> {
  inputs: FormInputData[];
  store: UseBoundStore<StoreApi<T>>;
  sliceKey: keyof Omit<T, 'update'>;
}

function FormThree<T extends { update: (path: any, values: any) => void }>({
  inputs,
  store,
  sliceKey,
}: FormThreeProps<T>) {
  // ✅ Correctly typed store selection
  const storeState = store(state => state[sliceKey]) as T[typeof sliceKey];

  const update = store(state => state.update);

  const formSchema = useMemo(() => {
    return createFormSchema(inputs);
  }, [inputs]);

  const {
    register,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: storeState as any,
    resolver: zodResolver(formSchema as any),
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    reset(storeState as any);
    }, [storeState, reset]);

  const watchedValues = useWatch({
    control,
  });

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }

  // On compare uniquement les clés du slice
  if (!isEqual(watchedValues, storeState)) {
    update(sliceKey, watchedValues);
  }
}, [watchedValues]);

  

  return (
    <div className="w-full room-form flex flex-col gap-4">
      {inputs.map((input, index) => {
        if (input.type === 'file' || input.type === 'image') {
          return (
            <div key={index} className="flex flex-col gap-2">
              <label>{input.label}</label>
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
            <div key={index} className="flex flex-col gap-2">
              <label className="font-medium">{input.label}</label>
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
                    className="py-2!"
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
                    className="
                      bg-zinc-800!
                      data-[state=checked]:bg-mauve!
                      border! border-zinc-700!
                      [&>span]:bg-zinc-400!
                      data-[state=checked]:[&>span]:bg-white!
                      [&>span]:shadow-md!
                    "
                  />
                )}
              />
            </div>
          );
        }

        // VECTOR3
        if (input.type === 'vector3') {
          return <Vector3Field control={control} input={input} />;
        }

        // HEX
        if (input.type === 'color') {
          return <HexColorField control={control} input={input} />;
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
                      className="slider-input"
                    />

                    <Slider
                      min={input.min ?? 0}
                      max={input.max ?? 10}
                      step={input.step ?? 0.1}
                      value={[field.value ?? 1]}
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
            <div key={index} className="flex flex-col gap-2">
              <label className="text-sm font-medium">{input.label}</label>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="px-3 py-1! flex justify-between items-center form-input bg-transparent! text-muted-foreground!"
                  >
                    <span>Choisir {input.label}</span>
                    <SquareArrowOutUpRight size={20} />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg dialog-btn">
                  {input.dialogueContent || 'Nothing to display'}
                </DialogContent>
              </Dialog>
            </div>
          );
        }

        // DEFAULT INPUT
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

export default FormThree;
