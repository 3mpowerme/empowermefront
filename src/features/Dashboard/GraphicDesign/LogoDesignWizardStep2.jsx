import React, { useEffect, useState } from 'react';
import CreatableSelect from '../../../components/CreatableSelect/CreatableSelect';
import TextArea from '../../../components/TextArea/TextArea';
import { useBusinessSectors } from '../../../hooks/useBusinessSectors';
import { mapCatalogToOptions } from '../../../utils/catalogs';
import FullScreenSpinner from '../../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../../utils/storage';
import { useConceptualization } from '../../../hooks/useConceptualization';

const LogoDesignWizardStep2 = () => {
  const logoDesignFromStorage = storage.getItem('logo_design') || {};
  const { step2: { business_sectors: business_sectorsFromStorage, about: aboutFromStorage } = {} } =
    logoDesignFromStorage;

  const [value, setValue] = useState(business_sectorsFromStorage ?? '');
  const { businessSectors, isLoadingBusinessSectors } = useBusinessSectors();
  const options = mapCatalogToOptions(businessSectors);
  const { setStepState } = useConceptualization();
  const [text, setText] = useState(aboutFromStorage ?? '');

  useEffect(() => {
    setStepState(2, {
      business_sectors: value,
      about: text,
      canContinue: !!value && !!text,
    });
  }, [value, text]);

  if (isLoadingBusinessSectors) {
    return <FullScreenSpinner />;
  }

  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-10 flex justify-center">
      <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl flex flex-col gap-y-6 sm:gap-y-10 items-stretch sm:items-center">
        <img
          className="w-40 sm:w-52 lg:w-60 mx-auto"
          src="/images/wizard/thumbnail_Frame.png"
          alt=""
        />

        <div className="w-full">
          <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-center">
            Ingresa tu industria
          </h1>
          <p className="text-base sm:text-lg text-center mt-2">Selecciona solo una opción</p>
        </div>

        <div className="w-full">
          <CreatableSelect
            options={options}
            value={value}
            onChange={setValue}
            placeholder="Selecciona el sector al que perteneces"
            enableAddItem={false}
          />
        </div>

        <div className="w-full">
          <TextArea
            id="aboutYou"
            name="aboutYou"
            placeholder="Describe detalladamente cual es tu negocio para que nuestra IA pueda realizar un análisis de posibles competidores y de mercardo"
            maxLength={500}
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default LogoDesignWizardStep2;
