import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, SendHorizontal } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';

import { FormInputRenderer } from './FormInputRenderer';
import { FormInputData } from './Input';

import { createFormSchema } from '@/lib/validation';

interface FormProps {
  inputs: FormInputData[];
  handleOnSubmit: SubmitHandler<FieldValues>;
  loading?: boolean;
  initialValues?: FieldValues;
}

export const Form: React.FC<FormProps> = ({
  inputs,
  handleOnSubmit,
  initialValues,
  loading = false,
}) => {
  const formSchema = createFormSchema(inputs);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    reset,
  } = useForm<FieldValues>({
    defaultValues: initialValues || {},
    resolver: zodResolver(formSchema as any),
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const onSubmit: SubmitHandler<FieldValues> = data => {
    handleOnSubmit(data);
    reset();
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

        <button type="submit" className="w-full form-button">
          {loading ? (
            <Loader2 />
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
