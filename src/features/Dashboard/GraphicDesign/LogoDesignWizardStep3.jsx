import React, { useEffect } from 'react';
import { useConceptualization } from '../../../hooks/useConceptualization';
import { useForm } from 'react-hook-form';

const LogoDesignWizardStep3 = ({ brandName }) => {
  const { setStepState } = useConceptualization();
  const { register, watch } = useForm({
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
    <div className="w-full px-4 py-6 sm:px-6 sm:py-10 flex justify-center">
      <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl">
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center">
          Seleciona el tipo de logo que te gustaría
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {suggestedLogoTypes?.map((opt) => {
            const isSelected = selectedLogoType === opt.value;
            return (
              <label
                key={opt.value}
                className={`bg-white relative cursor-pointer border-2 rounded-2xl p-4 sm:p-5 flex flex-col items-center transition-all duration-200
                  ${isSelected ? 'border-purple-600 shadow-lg' : 'border-opaque hover:border-gray-400'}
                `}>
                <input
                  type="radio"
                  value={opt.value}
                  {...register('logoType')}
                  className="hidden"
                />
                <img src={opt.image} alt={opt.label} className="h-16 sm:h-20 w-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 text-center">
                  {opt.label}
                </h3>
                <p className="text-sm text-gray-600 text-center mt-1">{opt.description}</p>
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
