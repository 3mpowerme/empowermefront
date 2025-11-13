import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useWizard } from '../../hooks/useWizard';
import Input from '../Input/Input';
import CardSelector from '../CardSelector/CardSelector';
import { mapShareholdersToCards } from '../../utils/catalogs';

function buildValidationSchema(fields) {
  const shape = {};

  fields.forEach((field) => {
    let validator = yup.mixed();

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'textarea':
        validator = yup.string();
        if (field.type === 'email') validator = validator.email('Formato de email invalido');
        if (field.min) validator = validator.min(field.min, `Minimo ${field.min} caracteres`);
        if (field.max) validator = validator.max(field.max, `Maximo ${field.max} caracteres`);
        break;

      case 'number':
        validator = yup.number().typeError('Debe ser un numero');
        if (field.min) validator = validator.min(field.min, `Minimo ${field.min}`);
        if (field.max) validator = validator.max(field.max, `Maximo ${field.max}`);
        break;

      case 'date':
        validator = yup.date().typeError('debe ser una fecha valida');
        break;

      case 'file':
        validator = yup
          .mixed()
          .test('fileSize', 'Archivo muy grande', (value) =>
            value && value[0] ? value[0].size <= (field.maxSize || 5000000) : true
          );
        break;

      case 'checkbox':
        validator = yup.boolean();
        break;

      case 'radio':
        if (field.multiple) {
          validator = yup
            .array()
            .of(yup.number().integer().positive())
            .min(1, `${field.label} es requerido`);
          break;
        }
        validator = yup.string();
        break;

      case 'select':
        validator = yup.string();
        break;

      case 'shareholders':
        validator = yup
          .array()
          .of(yup.number().integer().positive())
          .min(1, `${field.label} es requerido`);
        break;

      default:
        validator = yup.string();
    }

    if (field.required) validator = validator.required(`${field.label} es requerido`);
    shape[field.name] = validator;
  });

  return yup.object().shape(shape);
}

export default function StepForm({ step, onStepSubmit }) {
  const { formData, updateStepData } = useWizard();
  const defaultValues = { ...formData };

  const schema = buildValidationSchema(step.fields);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (formData) {
      Object.entries(formData).forEach(([k, v]) => {
        setValue(k, v);
      });
    }
  }, [formData, setValue]);

  function onSubmit(data) {
    updateStepData(data);
    if (onStepSubmit) onStepSubmit(data);
  }

  const renderField = (field, error) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea {...register(field.name)} className="mt-1 border rounded px-3 py-2 w-full" />
        );

      case 'select':
        return (
          <>
            {field.label && (
              <label className="mb-2.5" htmlFor={field.name}>
                {field.label}
              </label>
            )}
            <select
              {...register(field.name)}
              className="bg-white shadow-md hover:shadow-xl px-5 py-3 p-2 rounded w-full focus:outline-none focus:border-2 focus:border-primary">
              <option className="px-4 py-2 cursor-pointer hover:bg-primary" value="">
                Elige una opción
              </option>
              {field.options?.map((opt) => (
                <option
                  className="px-4 py-2 cursor-pointer hover:bg-primary"
                  key={opt.value}
                  value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && <span className="block text-red-700 mt-2">{error}</span>}
          </>
        );

      case 'checkbox':
        return <input type="checkbox" {...register(field.name)} className="mt-1" />;

      case 'radio':
        return (
          <>
            {field.label && (
              <label className="mb-2.5" htmlFor={field.name}>
                {field.label}
              </label>
            )}
            <div className="flex flex-wrap mt-2.5">
              {field.options?.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-1 w-full sm:w-1/2">
                  <input
                    type={field.multiple ? 'checkbox' : 'radio'}
                    value={opt.value}
                    {...register(field.name)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {error && <span className="block text-red-700 mt-2">{error}</span>}
          </>
        );

      case 'date':
        return (
          <input
            type="date"
            {...register(field.name)}
            className="mt-1 border rounded px-3 py-2 w-full"
          />
        );

      case 'file':
        return (
          <input
            type="file"
            {...register(field.name)}
            className="mt-1 border rounded px-3 py-2 w-full"
          />
        );

      case 'shareholders':
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={[]}
            render={({ field: { value, onChange } }) => (
              <>
                {field.label && (
                  <label className="mb-2.5" htmlFor={field.name}>
                    {field.label}
                  </label>
                )}
                <CardSelector
                  cards={mapShareholdersToCards(field.shareholders)}
                  columns={1}
                  multiple
                  initialValues={value}
                  onCardChange={onChange}
                  disabled={field.disabled}
                />
                {error && <span className="block text-red-700 mt-2">{error}</span>}
              </>
            )}
          />
        );

      default:
        return (
          <Input
            type={field.type || 'text'}
            {...register(field.name)}
            label={field.label}
            placeHolder={field.placeHolder}
            error={error}
            disabled={field.disabled}
          />
        );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full pr-0 sm:pr-6 md:pr-10 px-4 sm:px-0">
      {step.fields.map((field) => (
        <div key={field.name}>{renderField(field, errors[field?.name]?.message)}</div>
      ))}
      <button type="submit" className="hidden" id={`submit-${step.id}`}>
        Save
      </button>
    </form>
  );
}
