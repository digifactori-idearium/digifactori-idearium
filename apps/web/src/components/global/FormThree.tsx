import { zodResolver } from '@hookform/resolvers/zod';
import { isEqual } from 'lodash';
import { SquareArrowOutUpRight } from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';
import { useForm, Controller, FieldValues } from 'react-hook-form';

import FormInput, { FormInputData } from './Input';
import InputSelect from './InputSelect';
import UploadField from './UploadField';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { createFormSchema } from '@/lib/validation';
import { storeRegistry } from '@/stores';

interface FormThreeProps {
  inputs: FormInputData[];
  storeKey: keyof typeof storeRegistry;
  sliceKey: string;
}

const FormThree: React.FC<FormThreeProps> = ({
  inputs,
  storeKey,
  sliceKey,
}) => {
  const useSelectedStore = storeRegistry[storeKey];

  const storeState = useSelectedStore((state: any) => state[sliceKey]);
  const update = useSelectedStore((state: any) => state.update);

  const formSchema = useMemo(() => {
    return createFormSchema(inputs);
  }, [inputs]);

  const {
    register,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: storeState,
    resolver: zodResolver(formSchema as any),
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    const currentFormValues = control._formValues;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isEqual(currentFormValues, storeState)) {
      reset(storeState);
    }
  }, [storeState, reset, control]);

  useEffect(() => {
    const subscription = watch(values => {
      if (!isEqual(values, storeState)) {
        update(sliceKey, values);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, update, sliceKey, storeState]);

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

        //SELECT
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

        //SWITCH
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

        //DIALOG
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

        //DEFAULT INPUT
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
};

export default FormThree;
