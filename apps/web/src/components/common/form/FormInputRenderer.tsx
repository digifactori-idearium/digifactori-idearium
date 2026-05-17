import { SquareArrowOutUpRight } from 'lucide-react';
import {
  Control,
  Controller,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';

import { Slider } from '../../ui/slider';

import { AssetUploadField } from './AssetUploadField';
import { EmojiPickerField } from './EmojiField';
import { FieldMappingField } from './FieldMappingField';
import { HexColorField } from './HexColorField';
import { FormInput, FormInputData } from './Input';
import { InputSelect } from './InputSelect';
import { TagInput } from './TagsInput';
import { UploadField } from './UploadField';
import { Vector3Field } from './Vector3Field';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FieldError } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { actions } from '@/stores';

interface FormInputRendererProps {
  input: FormInputData;
  control: Control<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  errors: any;
  register: UseFormRegister<FieldValues>;
}

// Helper to extract nested error by dot-notation name
function getFieldError(errors: any, name: string) {
  const error = name.split('.').reduce((obj: any, key) => obj?.[key], errors);
  return error?.message ? [{ message: error.message }] : undefined;
}

export function FormInputRenderer({
  input,
  control,
  setValue,
  errors,
  register,
}: FormInputRendererProps) {
  const commonLabel = (
    <label className="text-sm font-medium">{input.label}</label>
  );

  // ASSETS
  if (input.type === 'assets') {
    return (
      <div className="flex flex-col gap-2">
        {commonLabel}
        <AssetUploadField
          name={input.name}
          setValue={setValue}
          placeholder={input.placeholder}
          error={errors[input.name]?.message as string}
          multiple={input.multiple !== false}
          acceptedTypes={input.acceptedTypes}
        />
      </div>
    );
  }

  // IMAGE / FILE
  if (input.type === 'file' || input.type === 'image') {
    return (
      <div className="flex flex-col gap-2">
        {commonLabel}
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
      <div className="form-input-container flex flex-col gap-2">
        {commonLabel}
        <Controller
          name={input.name}
          control={control}
          defaultValue={input.default ?? ''}
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
        <FieldError errors={getFieldError(errors, input.name)} />
      </div>
    );
  }

  // SWITCH
  if (input.type === 'switch') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{input.label}</label>
          <Controller
            name={input.name}
            control={control}
            defaultValue={input.default ?? false}
            render={({ field }) => (
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                id={input.name}
                className="bg-zinc-800! data-[state=checked]:bg-mauve! border-none! outline-none! 
                    shadow-none! [&>span]:bg-gray-400! data-[state=checked]:[&>span]:bg-white!"
              />
            )}
          />
        </div>
        <FieldError errors={getFieldError(errors, input.name)} />
      </div>
    );
  }

  // VECTOR3
  if (input.type === 'vector3') {
    return (
      <div>
        <Vector3Field control={control} input={input} />
      </div>
    );
  }

  // COLOR
  if (input.type === 'color') {
    return (
      <div>
        <HexColorField control={control} input={input} />
      </div>
    );
  }
  // EMOJI
  if (input.type === 'emoji') {
    return <EmojiPickerField control={control} input={input} />;
  }

  // SLIDER
  if (input.type === 'slider') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 justify-between">
          {commonLabel}
          <Controller
            name={input.name}
            control={control}
            defaultValue={input.default ?? input.min ?? 0} // ← default
            render={({ field }) => (
              <div className="flex w-full items-center gap-2">
                <input
                  type="number"
                  value={field.value}
                  min={input.min ?? 0}
                  max={input.max ?? 10}
                  step={input.step ?? 0.1}
                  onChange={e => {
                    field.onChange(Number(e.target.value));
                    if (input.name === 'scale')
                      setTimeout(actions.stackState, 200);
                  }}
                  className="slider-input w-12 text-xs"
                />
                <Slider
                  min={input.min ?? 0}
                  max={input.max ?? 10}
                  step={input.step ?? 0.1}
                  value={[field.value ?? 0]}
                  onValueChange={val => field.onChange(val[0])}
                  onValueCommit={() => {
                    if (input.name === 'scale') actions.stackState();
                  }}
                  className="sliderer flex-1 py-4 cursor-pointer"
                />
              </div>
            )}
          />
        </div>
        <FieldError errors={getFieldError(errors, input.name)} />
      </div>
    );
  }

  // FIELD MAPPING
  if (input.type === 'fieldMapping') {
    return (
      <div className="flex flex-col gap-2">
        {commonLabel}
        <FieldMappingField
          control={control}
          input={input}
          fields={input.mappingFields ?? {}}
        />
        <FieldError errors={getFieldError(errors, input.name)} />
      </div>
    );
  }

  // Tags
  if (input.type === 'tags') {
    return (
      <div className="flex flex-col gap-2">
        {commonLabel}
        <Controller
          name={input.name}
          control={control}
          defaultValue={input.default ?? []}
          render={({ field }) => (
            <TagInput
              value={field.value || []}
              onChange={field.onChange}
              placeholder={input.placeholder}
              error={errors[input.name]?.message as string}
            />
          )}
        />
        <FieldError errors={getFieldError(errors, input.name)} />
      </div>
    );
  }

  // DIALOG
  if (input.type === 'dialog') {
    const content =
      typeof input.dialogueContent === 'function'
        ? null
        : input.dialogueContent;
    return (
      <div className="form-input-container flex flex-col gap-2">
        {commonLabel}
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="px-3 py-1 flex justify-between items-center form-input bg-transparent! text-white! outline-none!"
            >
              <span>{input.label}</span>
              <SquareArrowOutUpRight size={16} />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-sidebar z-60">
            <DialogHeader>
              <DialogTitle>{input.label}</DialogTitle>
              <DialogDescription>
                Personnalisation ci-dessous.
              </DialogDescription>
            </DialogHeader>
            {content ?? 'Rien à afficher'}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // DEFAULT HTMLS INPUT
  return <FormInput input={input} register={register} errors={errors} />;
}
