import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import {
  useForm,
  SubmitHandler,
  Controller,
  FieldValues,
} from 'react-hook-form';

import FormInput, { FormInputData } from './Input';
import InputSelect from './InputSelect';
import UploadField from './UploadField';

import { createFormSchema } from '@/lib/validation';

interface FormProps {
  inputs: FormInputData[];
  handleOnSubmit: SubmitHandler<FieldValues>;
  loading?: boolean;
  initialValues?: FieldValues;
}

const Form: React.FC<FormProps> = ({
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
    <div className="login w-full flex flex-col gap-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        encType="multipart/form"
        className="w-full flex flex-col gap-4"
      >
        <div className="w-full flex flex-col gap-4">
          {inputs.map((input, index) => {
            if (input.type === 'file' || input.type === 'image') {
              return (
                <div key={index} className="formInput flex flex-col gap-2">
                  <label htmlFor={`InputSelect`}>
                    <b>{input.label}</b>
                    {input.required && <span className="text-red-600">*</span>}
                  </label>
                  <Controller
                    key={index}
                    name={input.name}
                    control={control}
                    rules={{
                      required: input.required ? 'File is required' : false,
                    }}
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
            if (input.type === 'select') {
              return (
                <div key={index} className="formInput flex flex-col gap-2">
                  <label htmlFor={`InputSelect`}>
                    <b>{input.label}</b>
                    {input.required && <span className="text-red-600">*</span>}
                  </label>
                  <Controller
                    name={input.name}
                    control={control}
                    rules={{ required: input.required ? 'Required' : false }}
                    render={({ field: { ref, ...field } }) => (
                      <InputSelect
                        {...field}
                        name={input.name}
                        error={errors[input.name]?.message as string}
                        options={input?.options || []}
                        placeholder={input.placeholder}
                        onChange={val => field.onChange(val)}
                        icon={input.icon}
                      />
                    )}
                  />
                </div>
              );
            }
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

        <button
          type="submit"
          className="w-full rounded-md bg-[#6F51B0]! p-2 text-white "
        >
          {loading ? <Loader2 /> : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Form;
