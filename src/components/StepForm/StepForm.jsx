import React, { useEffect, useState } from 'react';
import { Info, Repeat2, Check, Circle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useWizard } from '../../hooks/useWizard';
import { useApp } from '../../hooks/useApp';
import Input from '../Input/Input';
import CardSelector from '../CardSelector/CardSelector';
import { mapShareholdersToCards } from '../../utils/catalogs';
import { privateService } from '../../services/privateService';
import TextArea from '../TextArea/TextArea';
import PhoneInputModern from '../PhoneInputModern/PhoneInputModern';

function buildValidationSchema(fields) {
  const shape = {};

  const shareholderItemSchema = yup.object().shape({
    full_name: yup.string().max(255),
    tax_id: yup.string().max(20),
    unique_key: yup.string().max(50),
    address_region_commune: yup.string().max(255),
    nationality: yup.string().max(100),
    email: yup.string().email('Formato de email invalido').max(255),
  });

  const shareholderItemSchema2 = yup.object().shape({
    full_name: yup.string().max(255),
    tax_id: yup.string().max(20),
    address_region_commune: yup.string().max(255),
    profession: yup.string().max(100),
    phone: yup.string().matches(/^[0-9+()\-\s]*$/, 'Número telefónico inválido'),
  });

  const legalRepresentativeSchema = yup.object().shape({
    tax_id: yup.string().max(20),
    unique_key: yup.string().max(50),
  });

  const legalRepresentativeSchema2 = yup.object().shape({
    full_name: yup.string().max(255),
    tax_id: yup.string().max(20),
    nationality: yup.string().max(100),
  });

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
        validator = yup.mixed().test('fileSize', 'Archivo muy grande', (value) => {
          if (!value) return true;
          if (typeof value === 'string') return true;
          const files =
            value instanceof FileList ? Array.from(value) : Array.isArray(value) ? value : [];
          if (!files.length) return true;
          return files[0].size <= (field.maxSize || 5000000);
        });
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

      case 'phone':
        validator = yup.string().matches(/^[0-9+()\-\s]*$/, 'Número telefónico inválido');
        /*
        validator = yup
          .object()
          .shape({
            countryCode: yup.string().max(10),
            phone: yup.string().matches(/^\d*$/, 'Debe ser un numero').max(15, 'Maximo 15 digitos'),
            phone_code: yup.string().max(10),
          })
          .test('phone-required', `${field.label} es requerido`, (v) => {
            if (!field.required) return true;
            return Boolean(v && String(v.countryCode || '').trim() && String(v.phone || '').trim());
          });
          */
        break;

      case 'shareholders':
        validator = yup
          .array()
          .of(shareholderItemSchema)
          .min(1, `${field.label} es requerido`)
          .test('at-least-one-filled', `${field.label} es requerido`, (arr) => {
            if (!Array.isArray(arr) || arr.length === 0) return false;
            return arr.some((s) =>
              Object.values(s || {}).some((v) => String(v || '').trim().length > 0)
            );
          });
        break;
      case 'shareholders_2':
        validator = yup
          .array()
          .of(shareholderItemSchema2)
          .min(1, `${field.label} es requerido`)
          .test('at-least-one-filled', `${field.label} es requerido`, (arr) => {
            if (!Array.isArray(arr) || arr.length === 0) return false;
            return arr.some((s) =>
              Object.values(s || {}).some((v) => String(v || '').trim().length > 0)
            );
          });
        break;

      case 'legal_representative':
        validator = yup
          .array()
          .of(legalRepresentativeSchema)
          .min(1, `${field.label} es requerido`)
          .test('at-least-one-filled', `${field.label} es requerido`, (arr) => {
            if (!Array.isArray(arr) || arr.length === 0) return false;
            return arr.some((s) =>
              Object.values(s || {}).some((v) => String(v || '').trim().length > 0)
            );
          });
        break;
      case 'legal_representative_2':
        validator = yup
          .array()
          .of(legalRepresentativeSchema2)
          .min(1, `${field.label} es requerido`)
          .test('at-least-one-filled', `${field.label} es requerido`, (arr) => {
            if (!Array.isArray(arr) || arr.length === 0) return false;
            return arr.some((s) =>
              Object.values(s || {}).some((v) => String(v || '').trim().length > 0)
            );
          });
        break;

      case 'intelligence-text-select':
        validator = yup.array().min(1, `${field.label} es requerido`);
        break;

      default:
        validator = yup.string();
    }

    if (field.required && field.type !== 'shareholders' && field.type !== 'shareholders_2') {
      validator = validator.required(`${field.label} es requerido`);
    }

    shape[field.name] = validator;
  });

  return yup.object().shape(shape);
}

function IntelligenceTextSelect({ field, value, onChange, error }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [suggestedOptions, setSuggestedOptions] = useState([]);
  const [showInfer, setShowInfer] = useState(true);
  const [noResults, setNoResults] = useState(false);
  const [customActivity, setCustomActivity] = useState('');

  const handleToggleOption = (optionCode) => {
    const current = Array.isArray(value) ? value : [];
    if (current.includes(optionCode)) {
      onChange(current.filter((v) => v !== optionCode));
    } else {
      onChange([...current, optionCode]);
    }
  };

  const handleInfer = async () => {
    if (!field.endpoint || !description) return;
    setLoading(true);
    setApiError('');
    setNoResults(false);
    try {
      const data = await privateService.create(field.endpoint, {
        description,
      });
      const suggestions = data?.options || [];
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        setSuggestedOptions(suggestions);
        setShowInfer(false);
        setNoResults(false);
        setCustomActivity('');
        onChange(suggestions.map((opt) => opt.code));
      } else {
        setSuggestedOptions([]);
        setShowInfer(false);
        setNoResults(true);
        setCustomActivity('');
        onChange([]);
      }
    } catch (e) {
      setApiError('No se pudieron inferir las actividades, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        {field.label && (
          <label className="mb-1 font-bold text-md" htmlFor={field.name}>
            <Circle size={10} className="inline mr-2" />
            {field.label}
          </label>
        )}
        {field.tooltip && (
          <div className="relative group">
            <div className="flex items-center justify-center w-5 h-5 rounded-full text-primary">
              <Info className="w-5 h-5" />
            </div>
            <div className="absolute right-0 mt-2 hidden w-96 rounded-md bg-white p-4 text-xs leading-relaxed text-gray-700 shadow-lg group-hover:block z-20">
              {field.tooltip}
            </div>
          </div>
        )}
      </div>

      {showInfer && (
        <>
          <textarea
            className="mt-1 border rounded px-3 py-2 w-full text-sm"
            placeholder={
              field.placeHolder || 'Describe aquí las actividades económicas que quieres realizar'
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleInfer}
              disabled={loading || !description}
              className="bg-primary text-white text-xs px-4 py-2 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Analizando...' : 'Actividades sugeridas'}
            </button>
            {apiError && <span className="text-[11px] text-red-700">{apiError}</span>}
          </div>
        </>
      )}

      {noResults && !showInfer && (
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-sm text-gray-700">
            No encontramos actividades económicas con base en tu descripción. Escribe tu actividad
            económica.
          </p>
          <input
            type="text"
            className="mt-1 border rounded px-3 py-2 w-full text-sm"
            placeholder="Escribe tu actividad económica"
            value={customActivity}
            onChange={(e) => {
              const val = e.target.value;
              setCustomActivity(val);
              onChange(val ? [val] : []);
            }}
          />
          <a
            href="https://www.sii.cl/ayudas/ayudas_por_servicios/1956-codigos-1959.html"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary underline">
            Consulta el listado de actividades económicas aquí
          </a>
          <button
            type="button"
            onClick={() => {
              setShowInfer(true);
              setNoResults(false);
            }}
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
            <Repeat2 className="w-3 h-3" />
            Volver a intentar inferir
          </button>
        </div>
      )}

      {suggestedOptions.length > 0 && (
        <div>
          <div>
            {!showInfer && (
              <button
                type="button"
                onClick={() => {
                  setShowInfer(true);
                  setNoResults(false);
                }}
                disabled={loading || !description}
                className="bg-primary text-white text-xs px-4 py-2 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <Repeat2 className="inline mr-2" /> Volver a inferir
              </button>
            )}

            {suggestedOptions.length > 1 && (
              <p className="mt-5">Encontramos varios opciones, desmarca las que no aplican</p>
            )}
          </div>
          <div className="flex flex-row flex-wrap gap-2 mt-5">
            {suggestedOptions.map((opt) => {
              const selected = Array.isArray(value) && value.includes(opt.code);
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleToggleOption(opt.code)}
                  className={`text-xs px-3 py-1 transition ${
                    selected
                      ? 'text-primary border-b border-primary font-bold'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                  }`}>
                  {opt.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <span className="block text-red-700 mt-1 text-xs">{error}</span>}
    </div>
  );
}

export default function StepForm({ step, onStepSubmit }) {
  const { formData, updateStepData } = useWizard();
  const { setToast } = useApp();
  const [fileProgress, setFileProgress] = useState({});
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

  function putWithProgress(url, blob, contentType, onProgress, result) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', contentType || 'application/octet-stream');
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve(result) : reject());
      xhr.onerror = reject;
      xhr.send(blob);
    });
  }

  async function uploadSingleFile(field, file) {
    if (!file) {
      setToast({
        show: true,
        message: 'Selecciona un archivo',
        type: 'error',
        button: {},
      });
      return;
    }

    if (field.maxSize && file.size > field.maxSize) {
      setToast({
        show: true,
        message: 'El archivo excede el tamaño máximo permitido',
        type: 'error',
        button: {},
      });
      return;
    }

    const endpoint = field.uploadEndpoint || field.uploadUrlEndpoint;
    const directUrl = field.uploadUrl || field.url;

    try {
      let objectUrlFromApi = '';

      if (endpoint) {
        const res = await privateService.create(endpoint, {
          content_type: file.type || 'application/octet-stream',
          file_name: file.name,
        });
        const object_url = res?.object_url || '';
        objectUrlFromApi = await putWithProgress(
          res.upload_url,
          file,
          file.type,
          (p) => setFileProgress((prev) => ({ ...prev, [field.name]: p })),
          object_url
        );
      } else if (directUrl) {
        objectUrlFromApi = await putWithProgress(
          directUrl,
          file,
          file.type,
          (p) => setFileProgress((prev) => ({ ...prev, [field.name]: p })),
          ''
        );
      } else {
        return;
      }

      const finalObjectUrl = objectUrlFromApi || '';
      if (finalObjectUrl) {
        setValue(field.name, finalObjectUrl, { shouldValidate: true, shouldDirty: true });
      }

      setToast({
        show: true,
        message: 'Archivo subido correctamente',
        type: 'success',
        button: {},
      });
    } catch (e) {
      setToast({
        show: true,
        message: 'Ocurrió un error al subir el archivo',
        type: 'error',
        button: {},
      });
    }
  }

  function buildFormData(data) {
    const formData = new FormData();
    const fileFieldNames = step.fields.filter((f) => f.type === 'file').map((f) => f.name);

    Object.entries(data).forEach(([key, value]) => {
      if (fileFieldNames.includes(key)) {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      } else if (Array.isArray(value)) {
        value.forEach((v) => {
          formData.append(`${key}[]`, v);
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return formData;
  }

  async function onSubmit(data) {
    updateStepData(data);
    const formData = buildFormData(data);
    if (onStepSubmit) onStepSubmit(data, formData);
  }

  const renderField = (field, error) => {
    switch (field.type) {
      case 'phone':
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={{ countryCode: '', phone: '', phone_code: '' }}
            render={({ field: { value, onChange } }) => (
              <PhoneInputModern
                label={field.label}
                error={error}
                defaultCountryCode={(value && value.countryCode) || field.defaultCountryCode}
                className={field.className}
                onChange={(v) => onChange(v.phone)}
              />
            )}
          />
        );

      case 'textarea':
        return <TextArea label={field.label} {...register(field.name)} maxLength={500} rows={6} />;

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
          <>
            {field.label && (
              <label className="mb-2.5" htmlFor={field.name}>
                {field.label}
              </label>
            )}

            <input
              type="date"
              {...register(field.name)}
              className="mt-1 border rounded px-3 py-2 w-full"
            />
          </>
        );

      case 'file': {
        const progress = fileProgress[field.name];

        return (
          <>
            <input type="hidden" {...register(field.name)} />

            {field.label && (
              <div className="flex flex-col mb-2.5 gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor={field.name} className="text-md font-bold">
                    <Circle size={10} className="inline mr-2" />
                    {field.label}
                  </label>
                  {field.tooltip && (
                    <div className="relative group">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full text-primary">
                        <Info className="w-5 h-5" />
                      </div>
                      <div className="absolute right-0 mt-2 hidden w-96 rounded-md bg-white p-4 text-xs leading-relaxed text-gray-700 shadow-lg group-hover:block z-20">
                        {field.tooltip}
                      </div>
                    </div>
                  )}
                </div>

                {Array.isArray(field.fileOptions) && field.fileOptions.length > 0 && (
                  <div className="flex flex-col gap-1 text-xs">
                    {field.fileOptions.map((opt) => (
                      <div
                        key={opt.value || opt.label}
                        className="flex items-start justify-between gap-2 group">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          <span className="text-gray-800">{opt.label}</span>
                        </div>
                        {opt.tooltip && (
                          <div className="relative">
                            <div className="flex items-center justify-center w-5 h-5 rounded-full text-primary shrink-0">
                              <Info className="w-5 h-5" />
                            </div>
                            <div className="absolute right-0 mt-2 hidden w-96 rounded-md bg-white p-4 text-xs leading-relaxed text-gray-700 shadow-lg group-hover:block z-20">
                              {opt.tooltip}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <input
                type="file"
                className="mt-1 border rounded px-3 py-2 w-full"
                onChange={async (e) => {
                  const f = e.target.files && e.target.files[0];
                  await uploadSingleFile(field, f);
                }}
              />
              {typeof progress === 'number' && progress > 0 && progress < 100 && (
                <span className="text-[11px] text-gray-500">{progress}%</span>
              )}
            </div>
            {error && <span className="block text-red-700 mt-1 text-xs">{error}</span>}
          </>
        );
      }

      case 'shareholders':
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={[
              {
                full_name: '',
                tax_id: '',
                unique_key: '',
                address_region_commune: '',
                nationality: '',
                email: '',
              },
            ]}
            render={({ field: { value, onChange } }) => {
              const list = Array.isArray(value) ? value : [];

              const addShareholder = () => {
                onChange([
                  ...list,
                  {
                    full_name: '',
                    tax_id: '',
                    unique_key: '',
                    address_region_commune: '',
                    nationality: '',
                    email: '',
                  },
                ]);
              };

              const removeShareholder = (index) => {
                onChange(list.filter((_, i) => i !== index));
              };

              const updateShareholder = (index, key, val) => {
                const next = list.map((item, i) =>
                  i === index ? { ...(item || {}), [key]: val } : item
                );
                onChange(next);
              };

              return (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    {field.label && (
                      <label className="mb-1 font-bold text-md" htmlFor={field.name}>
                        <Circle size={10} className="inline mr-2" />
                        {field.label}
                      </label>
                    )}

                    <button
                      type="button"
                      onClick={addShareholder}
                      className="bg-primary text-white text-xs px-4 py-2 rounded-full hover:bg-purple-700">
                      + Agregar
                    </button>
                  </div>

                  {list.length === 0 && (
                    <button
                      type="button"
                      onClick={addShareholder}
                      className="bg-primary text-white text-xs px-4 py-2 rounded-full hover:bg-purple-700 w-fit">
                      + Agregar accionista
                    </button>
                  )}

                  {list.map((s, idx) => (
                    <div key={idx} className="bg-white shadow-md hover:shadow-xl p-4 rounded">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-sm">Accionista #{idx + 1}</p>
                        {list.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeShareholder(idx)}
                            className="text-xs text-red-700">
                            Eliminar
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        <Input
                          type="text"
                          label="Nombre completo"
                          value={(s && s.full_name) || ''}
                          onChange={(e) => updateShareholder(idx, 'full_name', e.target.value)}
                        />

                        <Input
                          type="text"
                          label="RUT"
                          value={(s && s.tax_id) || ''}
                          onChange={(e) => updateShareholder(idx, 'tax_id', e.target.value)}
                        />

                        <Input
                          type="text"
                          label="Clave única"
                          value={(s && s.unique_key) || ''}
                          onChange={(e) => updateShareholder(idx, 'unique_key', e.target.value)}
                        />

                        <Input
                          type="text"
                          label="Dirección (Región / Comuna)"
                          value={(s && s.address_region_commune) || ''}
                          onChange={(e) =>
                            updateShareholder(idx, 'address_region_commune', e.target.value)
                          }
                        />

                        <Input
                          type="text"
                          label="Nacionalidad"
                          value={(s && s.nationality) || ''}
                          onChange={(e) => updateShareholder(idx, 'nationality', e.target.value)}
                        />

                        <Input
                          type="email"
                          label="Email"
                          value={(s && s.email) || ''}
                          onChange={(e) => updateShareholder(idx, 'email', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  {error && <span className="block text-red-700 mt-2 text-xs">{error}</span>}
                </div>
              );
            }}
          />
        );

      case 'legal_representative':
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={[
              {
                tax_id: '',
                unique_key: '',
              },
            ]}
            render={({ field: { value, onChange } }) => {
              const list = Array.isArray(value) ? value : [];

              const addShareholder = () => {
                onChange([
                  ...list,
                  {
                    tax_id: '',
                    unique_key: '',
                  },
                ]);
              };

              const removeShareholder = (index) => {
                onChange(list.filter((_, i) => i !== index));
              };

              const updateShareholder = (index, key, val) => {
                const next = list.map((item, i) =>
                  i === index ? { ...(item || {}), [key]: val } : item
                );
                onChange(next);
              };

              return (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    {field.label && (
                      <label className="mb-1 font-bold text-md" htmlFor={field.name}>
                        <Circle size={10} className="inline mr-2" />
                        {field.label}
                      </label>
                    )}

                    <button
                      type="button"
                      onClick={addShareholder}
                      className="bg-primary text-white text-xs px-4 py-2 rounded-full hover:bg-purple-700">
                      + Agregar
                    </button>
                  </div>

                  {list.length === 0 && (
                    <button
                      type="button"
                      onClick={addShareholder}
                      className="bg-primary text-white text-xs px-4 py-2 rounded-full hover:bg-purple-700 w-fit">
                      + Agregar representante legal
                    </button>
                  )}

                  {list.map((s, idx) => (
                    <div key={idx} className="bg-white shadow-md hover:shadow-xl p-4 rounded">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-sm">Representante legal #{idx + 1}</p>
                        {list.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeShareholder(idx)}
                            className="text-xs text-red-700">
                            Eliminar
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        <Input
                          type="text"
                          label="RUT"
                          value={(s && s.tax_id) || ''}
                          onChange={(e) => updateShareholder(idx, 'tax_id', e.target.value)}
                        />

                        <Input
                          type="text"
                          label="Clave única"
                          value={(s && s.unique_key) || ''}
                          onChange={(e) => updateShareholder(idx, 'unique_key', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  {error && <span className="block text-red-700 mt-2 text-xs">{error}</span>}
                </div>
              );
            }}
          />
        );

      case 'legal_representative_2':
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={[
              {
                full_name: '',
                tax_id: '',
                nationality: '',
              },
            ]}
            render={({ field: { value, onChange } }) => {
              const list = Array.isArray(value) ? value : [];

              const addShareholder = () => {
                onChange([
                  ...list,
                  {
                    full_name: '',
                    tax_id: '',
                    nationality: '',
                  },
                ]);
              };

              const removeShareholder = (index) => {
                onChange(list.filter((_, i) => i !== index));
              };

              const updateShareholder = (index, key, val) => {
                const next = list.map((item, i) =>
                  i === index ? { ...(item || {}), [key]: val } : item
                );
                onChange(next);
              };

              return (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    {field.label && (
                      <label className="mb-1 font-bold text-md" htmlFor={field.name}>
                        <Circle size={10} className="inline mr-2" />
                        {field.label}
                      </label>
                    )}

                    <button
                      type="button"
                      onClick={addShareholder}
                      className="bg-primary text-white text-xs px-4 py-2 rounded-full hover:bg-purple-700">
                      + Agregar
                    </button>
                  </div>

                  {list.length === 0 && (
                    <button
                      type="button"
                      onClick={addShareholder}
                      className="bg-primary text-white text-xs px-4 py-2 rounded-full hover:bg-purple-700 w-fit">
                      + Agregar representante legal
                    </button>
                  )}

                  {list.map((s, idx) => (
                    <div key={idx} className="bg-white shadow-md hover:shadow-xl p-4 rounded">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-sm">Representante legal #{idx + 1}</p>
                        {list.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeShareholder(idx)}
                            className="text-xs text-red-700">
                            Eliminar
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        <Input
                          type="text"
                          label="Nombre completo"
                          value={(s && s.full_name) || ''}
                          onChange={(e) => updateShareholder(idx, 'full_name', e.target.value)}
                        />

                        <Input
                          type="text"
                          label="RUT"
                          value={(s && s.tax_id) || ''}
                          onChange={(e) => updateShareholder(idx, 'tax_id', e.target.value)}
                        />

                        <Input
                          type="text"
                          label="Nacionalidad"
                          value={(s && s.nationality) || ''}
                          onChange={(e) => updateShareholder(idx, 'nationality', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  {error && <span className="block text-red-700 mt-2 text-xs">{error}</span>}
                </div>
              );
            }}
          />
        );

      case 'shareholders_2':
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={[
              {
                full_name: '',
                tax_id: '',
                address_region_commune: '',
                profession: '',
                phone: '',
              },
            ]}
            render={({ field: { value, onChange } }) => {
              const list = Array.isArray(value) ? value : [];

              const addShareholder = () => {
                onChange([
                  ...list,
                  {
                    full_name: '',
                    tax_id: '',
                    address_region_commune: '',
                    profession: '',
                    phone: '',
                  },
                ]);
              };

              const removeShareholder = (index) => {
                onChange(list.filter((_, i) => i !== index));
              };

              const updateShareholder = (index, key, val) => {
                const next = list.map((item, i) =>
                  i === index ? { ...(item || {}), [key]: val } : item
                );
                onChange(next);
              };

              return (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    {field.label && (
                      <label className="mb-1 font-bold text-md" htmlFor={field.name}>
                        <Circle size={10} className="inline mr-2" />
                        {field.label}
                      </label>
                    )}

                    <button
                      type="button"
                      onClick={addShareholder}
                      className="bg-primary text-white text-xs px-4 py-2 rounded-full hover:bg-purple-700">
                      + Agregar
                    </button>
                  </div>

                  {list.length === 0 && (
                    <button
                      type="button"
                      onClick={addShareholder}
                      className="bg-primary text-white text-xs px-4 py-2 rounded-full hover:bg-purple-700 w-fit">
                      + Agregar accionista
                    </button>
                  )}

                  {list.map((s, idx) => (
                    <div key={idx} className="bg-white shadow-md hover:shadow-xl p-4 rounded">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-sm">Accionista #{idx + 1}</p>
                        {list.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeShareholder(idx)}
                            className="text-xs text-red-700">
                            Eliminar
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        <Input
                          type="text"
                          label="Nombre completo"
                          value={(s && s.full_name) || ''}
                          onChange={(e) => updateShareholder(idx, 'full_name', e.target.value)}
                        />

                        <Input
                          type="text"
                          label="RUT"
                          value={(s && s.tax_id) || ''}
                          onChange={(e) => updateShareholder(idx, 'tax_id', e.target.value)}
                        />

                        <Input
                          type="text"
                          label="Dirección (Región / Comuna)"
                          value={(s && s.address_region_commune) || ''}
                          onChange={(e) =>
                            updateShareholder(idx, 'address_region_commune', e.target.value)
                          }
                        />

                        <Input
                          type="text"
                          label="Profesión/Oficio"
                          value={(s && s.profession) || ''}
                          onChange={(e) => updateShareholder(idx, 'profession', e.target.value)}
                        />

                        <PhoneInputModern
                          label="Número telefónico"
                          value={(s && s.phone) || ''}
                          onChange={(e) => {
                            console.log('HERE', e);
                            updateShareholder(idx, 'phone', e.phone);
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {error && <span className="block text-red-700 mt-2 text-xs">{error}</span>}
                </div>
              );
            }}
          />
        );

      case 'intelligence-text-select':
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={[]}
            render={({ field: { value, onChange } }) => (
              <IntelligenceTextSelect
                field={field}
                value={value}
                onChange={onChange}
                error={error}
              />
            )}
          />
        );

      default: {
        const isTextType = (field.type || 'text') === 'text';
        if (isTextType && field.tooltip) {
          return (
            <div className="flex flex-col gap-1">
              {field.label && (
                <div className="flex items-center justify-between mb-1">
                  <label className="text-md font-bold" htmlFor={field.name}>
                    <Circle size={10} className="inline mr-2" />
                    {field.label}
                  </label>
                  <div className="relative group">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full text-primary">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="absolute right-0 mt-2 hidden w-96 rounded-md bg-white p-4 text-xs leading-relaxed text-gray-700 shadow-lg group-hover:block z-20">
                      {field.tooltip}
                    </div>
                  </div>
                </div>
              )}
              <Input
                type="text"
                {...register(field.name)}
                label={undefined}
                placeHolder={field.placeHolder}
                error={error}
                disabled={field.disabled}
              />
            </div>
          );
        }

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
