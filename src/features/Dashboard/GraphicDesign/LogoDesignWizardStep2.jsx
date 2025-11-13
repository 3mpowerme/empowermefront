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
  const [value, setValue] = useState('');
  const { businessSectors, isLoadingBusinessSectors } = useBusinessSectors();
  console.log('businessSectors', businessSectors);
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
    <div className="flex flex-col gap-y-10 items-center w-xl">
      <img className="w-60" src="/images/wizard/thumbnail_Frame.png"></img>
      <h1 className="font-bold text-4xl text-center">Ingresa tu industria</h1>
      <p className="text-lg text-center">Selecciona solo una opción</p>
      <CreatableSelect
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Selecciona el sector al que perteneces"
        enableAddItem={false}
      />
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
  );
};

export default LogoDesignWizardStep2;
