import React, { useEffect, useState } from 'react';
import { useConceptualization } from '../../../hooks/useConceptualization';
import { useForm } from 'react-hook-form';
import Switch from '../../../components/Switch/Switch';
import FullScreenSpinner from '../../../components/FullScreenSpinner/FullScreenSpinner';
import { useCustomEvent } from '../../../hooks/useCustomEvent';

const CUSTOM_VALUE = 'custom';

const ConceptualizationWizardStep5 = () => {
  const { state: { brandBookOptions, isLoading } = {}, setStepState } = useConceptualization();

  const [error, setError] = useState({
    brandName: '',
    brandNameCustom: '',
    slogan: '',
    logoType: '',
    colorimetry: '',
  });
  const { register, watch, setValue } = useForm({
    defaultValues: {
      brandName: '',
      brandNameCustom: '',
      slogan: '',
      sloganCustom: '',
      logoType: '',
      colorimetry: '',
    },
  });

  const { brandNames = [], slogans = [], colorimetries = [] } = brandBookOptions || {};

  const selectedLogoType = watch('logoType');
  const selectedBrandName = watch('brandName');
  const brandNameCustom = watch('brandNameCustom');
  const selectedSlogan = watch('slogan');
  const sloganCustom = watch('sloganCustom');
  const selectedColorimetry = watch('colorimetry');

  const effectiveBrandName =
    selectedBrandName === CUSTOM_VALUE ? (brandNameCustom || '').trim() : selectedBrandName;
  const effectiveSlogan =
    selectedSlogan === CUSTOM_VALUE ? (sloganCustom || '').trim() : selectedSlogan;

  useEffect(() => {
    if (selectedBrandName !== CUSTOM_VALUE && brandNameCustom) setValue('brandNameCustom', '');
  }, [selectedBrandName]);
  useEffect(() => {
    if (selectedSlogan !== CUSTOM_VALUE && sloganCustom) setValue('sloganCustom', '');
  }, [selectedSlogan]);

  useEffect(() => {
    const canContinue =
      !!selectedLogoType && !!effectiveBrandName && !!effectiveSlogan && !!selectedColorimetry;

    if (canContinue)
      setStepState(5, {
        brand_name: effectiveBrandName || null,
        slogan: effectiveSlogan || null,
        logo_type: selectedLogoType || null,
        colorimetry: colorimetries.find((it) => it.value === selectedColorimetry)?.colors || null,
        colorimetry_name: colorimetries.find((it) => it.value === selectedColorimetry)?.label || '',
        canContinue,
      });
  }, [selectedLogoType, effectiveBrandName, effectiveSlogan, selectedColorimetry, colorimetries]);

  const suggestedLogoTypes = [
    {
      label: 'Basado en iconos',
      description: 'Una forma fácil de recordar en el centro del diseño de su logotipo',
      image: '/images/dashboard/conceptualization/iconBased.png',
      value: 'Basado en iconos',
    },
    {
      label: 'Basado en nombre',
      description: 'El nombre de tu empresa con elemento clave del diseño de su logotipo',
      image: '/images/dashboard/conceptualization/nameBased.png',
      value: 'Basado en nombre',
    },
    {
      label: 'Basado en inicial',
      description: 'Inicial como elemento principal del diseño de su logotipo',
      image: '/images/dashboard/conceptualization/firstLetterBased.png',
      value: 'Basado en inicial',
    },
  ];

  useCustomEvent('cannot-continue', (data) => {
    console.log('here data', data);
    // TODO later
    return;
    const newError = { business_sectors: '', about: '', region: '' };
    if (!data.business_sectors) {
      newError.business_sectors = 'Por favor elige un sector';
    }
    if (!data.about) {
      newError.about = 'Por favor escribe una descripción';
    }
    if (!data.region) {
      newError.region = 'Por favor elige una región';
    }
    setError(newError);
  });

  return (
    <Switch value={isLoading}>
      <Switch.Item case={true}>
        <FullScreenSpinner
          message="Generando opciones para tu negocio"
          showProgress
          duration={5 * 1000} // 5 seconds
        />
      </Switch.Item>
      <Switch.Item case={false}>
        <div className="flex flex-row flex-wrap h-full w-full">
          {/* Brand name */}
          <div className="w-full md:w-1/2 md:p-5">
            <p className="text-2xl font-bold mb-2.5">Seleciona un nombre para tu marca</p>
            <div className="box flex flex-row flex-wrap">
              {brandNames?.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-1 w-full md:w-1/2 p-2">
                  <span className="text-sm font-medium mr-2 max-w-30 break-words">{opt.label}</span>
                  <input
                    type="radio"
                    value={opt.value}
                    className="appearance-none w-5 h-5 rounded-full border-2 border-white bg-black
                    checked:bg-purple-600 checked:border-principal
                    transition-colors duration-200 cursor-pointer shadow hover:border-opaque"
                    {...register('brandName')}
                  />
                  {error.brandName && <span className="text-red-700">{error.region}</span>}
                </label>
              ))}

              <label className="flex items-center w-full p-2 gap-2">
                <span className="text-sm font-medium mr-2">Elige el tuyo</span>
                <input
                  type="radio"
                  value={CUSTOM_VALUE}
                  className="appearance-none w-5 h-5 rounded-full border-2 border-white bg-black
                  checked:bg-purple-600 checked:border-principal
                  transition-colors duration-200 cursor-pointer shadow hover:border-opaque"
                  {...register('brandName')}
                />
                <input
                  type="text"
                  placeholder="Escribe el nombre de tu marca"
                  className="bg-white flex-1 min-w-0 rounded-lg border border-opaque px-3 py-2 text-sm
                  focus:outline-none focus:border-2 focus:border-primary disabled:bg-opaque"
                  {...register('brandNameCustom')}
                  disabled={selectedBrandName !== CUSTOM_VALUE}
                />
              </label>
            </div>
          </div>

          {/* slogan */}
          <div className="w-full md:w-1/2 md:p-5">
            <p className="text-2xl font-bold mb-2.5">Seleciona una frase para tu marca</p>
            <div className="box flex flex-row flex-wrap">
              {slogans?.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-1 w-full md:w-1/3 p-2">
                  <span className="text-sm font-medium mr-2 max-w-30 break-words">{opt.label}</span>
                  <input
                    type="radio"
                    value={opt.value}
                    className="appearance-none w-5 h-5 rounded-full border-2 border-white bg-black
                    checked:bg-purple-600 checked:border-principal
                    transition-colors duration-200 cursor-pointer shadow hover:border-opaque"
                    {...register('slogan')}
                  />
                </label>
              ))}

              <label className="flex items-center w-full p-2 gap-2">
                <span className="text-sm font-medium mr-2">Elige el tuyo</span>
                <input
                  type="radio"
                  value={CUSTOM_VALUE}
                  className="appearance-none w-5 h-5 rounded-full border-2 border-white bg-black
                  checked:bg-purple-600 checked:border-principal
                  transition-colors duration-200 cursor-pointer shadow hover:border-opaque"
                  {...register('slogan')}
                />
                <input
                  type="text"
                  placeholder="Escribe la frase de tu marca"
                  className="bg-white flex-1 min-w-0 rounded-lg border border-opaque px-3 py-2 text-sm
                  focus:outline-none focus:border-2 focus:border-primary disabled:bg-opaque"
                  {...register('sloganCustom')}
                  disabled={selectedSlogan !== CUSTOM_VALUE}
                />
              </label>
            </div>
          </div>

          {/* logo type */}
          <div className="w-full md:w-1/2 md:p-5">
            <p className="text-2xl font-bold mb-2.5">Seleciona el tipo de logo que te gustaría</p>
            <div className="box grid grid-cols-2 md:grid-cols-3">
              {suggestedLogoTypes?.map((opt) => {
                const isSelected = selectedLogoType === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`bg-white relative cursor-pointer border-2 rounded-2xl md:p-5 m-5 flex flex-col items-center transition-all duration-200
                      ${isSelected ? 'border-purple-600 shadow-lg bg-white' : 'border-opaque hover:border-gray-400'}
                    `}>
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('logoType')}
                      className="hidden"
                    />
                    <img src={opt.image} alt={opt.label} className="h-20" />
                    <h3 className="text-lg font-semibold text-gray-800 text-center">{opt.label}</h3>
                    <p className="text-sm text-gray-600 text-center">{opt.description}</p>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-4 h-4 bg-purple-600 rounded-full" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* colometry */}
          <div className="w-full md:w-1/2 md:p-5 pl-0">
            <p className="text-2xl font-bold mb-2.5">Seleciona colorimetría</p>
            <div className="box flex flex-row flex-wrap">
              {colorimetries?.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-1 w-full md:w-1/2 p-2">
                  <span className="text-sm font-medium mr-2 max-w-24">{opt.label}</span>
                  <div className="flex flex-row mr-2">
                    {opt?.colors?.map((it) => (
                      <span
                        key={it}
                        className="w-4 h-4 transition-transform transform hover:scale-200 cursor-pointer"
                        style={{ backgroundColor: `${it}` }}
                      />
                    ))}
                  </div>
                  <input
                    type="radio"
                    value={opt.value}
                    className="appearance-none w-5 h-5 rounded-full border-2 border-white bg-black
                    checked:bg-purple-600 checked:border-principal
                    transition-colors duration-200 cursor-pointer shadow hover:border-opaque"
                    {...register('colorimetry')}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </Switch.Item>
    </Switch>
  );
};

export default ConceptualizationWizardStep5;
