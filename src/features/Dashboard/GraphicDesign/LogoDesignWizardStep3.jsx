import React, { useEffect } from 'react';
import { useConceptualization } from '../../../hooks/useConceptualization';
import { useForm } from 'react-hook-form';

const LogoDesignWizardStep3 = ({ brandName }) => {
  const { setStepState } = useConceptualization();
  const { register, handleSubmit, watch, getValues } = useForm({
    defaultValues: {
      brandName: brandName,
      logoType: '',
    },
  });

  const selectedLogoType = watch('logoType');

  useEffect(() => {
    setStepState(3, {
      brand_name: brandName,
      logo_type: selectedLogoType,
    });
  }, [brandName, selectedLogoType]);

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

  return (
    <div className="flex flex-row justify-center flex-wrap h-full w-full">
      <div className="w-1/2 p-5">
        <p className="text-2xl font-bold mb-2.5 text-center">
          Seleciona el tipo de logo que te gustaría
        </p>
        <div className="border border-opaque rounded-lg grid grid-cols-3">
          {suggestedLogoTypes?.map((opt) => {
            const isSelected = selectedLogoType === opt.value;
            return (
              <label
                key={opt.value}
                className={`bg-white relative cursor-pointer border-2 rounded-2xl p-5 m-5 flex flex-col items-center transition-all duration-200
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
    </div>
  );
};

export default LogoDesignWizardStep3;
