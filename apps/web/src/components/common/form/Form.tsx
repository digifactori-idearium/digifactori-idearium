import { zodResolver } from '@hookform/resolvers/zod';
import { SendHorizontal } from 'lucide-react';
import React, { useEffect } from 'react';
import {
  useForm,
  SubmitHandler,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';

import { FormInputRenderer } from './FormInputRenderer';
import { FormInputData } from './Input';

import { ButtonLoading } from '@/components/common/Loading';
import { createFormSchema } from '@/lib/validation';

interface FormProps {
  inputs: FormInputData[];
  handleOnSubmit: (data: FieldValues) => Promise<boolean | void>;
  loading?: boolean;
  initialValues?: FieldValues;
  form?: UseFormReturn<FieldValues>;
}

export const Form: React.FC<FormProps> = ({
  inputs,
  handleOnSubmit,
  initialValues,
  loading = false,
  form: externalForm,
}) => {
  const internalForm = useForm<FieldValues>({
    defaultValues:
      initialValues ||
      inputs.reduce(
        (acc, input) => ({
          ...acc,
          ...(input.default !== undefined
            ? { [input.name]: input.default }
            : {}),
        }),
        {}
      ),
    resolver: zodResolver(createFormSchema(inputs) as any),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    reset,
  } = externalForm ?? internalForm;

  useEffect(() => {
    if (initialValues) reset(initialValues);
  }, [initialValues, reset]);

  const onSubmit: SubmitHandler<FieldValues> = async data => {
    const result = await handleOnSubmit(data);
    if (result !== false) reset(); // reset only on success
  };

  return (
    <div className="dynamic-form w-full flex flex-col gap-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        encType="multipart/form"
        className="w-full flex flex-col gap-4"
      >
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
        <button type="submit" className="w-full form-button" disabled={loading}>
          {loading ? (
            <div className="flex gap-2 justify-center items-center">
              <ButtonLoading />
            </div>
          ) : (
            <div className="flex gap-2 justify-center items-center">
              <SendHorizontal /> Envoyer
            </div>
          )}
        </button>
      </form>
    </div>
  );
};
