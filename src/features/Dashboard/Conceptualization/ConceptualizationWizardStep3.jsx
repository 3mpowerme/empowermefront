import React, { useEffect, useState } from 'react';
import CreatableSelect from '../../../components/CreatableSelect/CreatableSelect';
import TextArea from '../../../components/TextArea/TextArea';
import { useBusinessSectors } from '../../../hooks/useBusinessSectors';
import { mapCatalogToOptions } from '../../../utils/catalogs';
import FullScreenSpinner from '../../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../../utils/storage';
import { useRegion } from '../../../hooks/useRegion';
import Select from '../../../components/Select/Select';
import { useConceptualization } from '../../../hooks/useConceptualization';

const ConceptualizationWizardStep3 = () => {
  const conceptualizationFromStorage = storage.getItem('conceptualization') || {};
  const {
    step3: {
      about: aboutFromStorage,
      business_sectors: business_sectorsFromStorage,
      region: regionFromStorage,
    } = {},
  } = conceptualizationFromStorage;
  const [text, setText] = useState(aboutFromStorage ?? '');
  const [value, setValue] = useState(business_sectorsFromStorage ?? '');
  const { businessSectors, isLoadingBusinessSectors } = useBusinessSectors();
  const { region, isLoading: isLoadingRegion } = useRegion();
  const options = mapCatalogToOptions(businessSectors);
  const { setStepState } = useConceptualization();
  const [state, setState] = useState({
    regionSelected: regionFromStorage,
  });

  useEffect(() => {
    setStepState(3, {
      business_sectors: value,
      about: text,
      region: state.regionSelected,
      canContinue: value && text && state.regionSelected,
    });
  }, [text, value, state.regionSelected]);

  if (isLoadingBusinessSectors || isLoadingRegion) {
    return <FullScreenSpinner />;
  }

  const handleChange = (option) => {
    setState((prevState) => ({ ...prevState, regionSelected: option }));
  };

  return (
    <div className="flex flex-col items-center gap-y-8 sm:gap-y-10 w-full max-w-3xl mx-auto px-4 sm:px-6">
      <img
        className="w-48 sm:w-60 max-w-full h-auto"
        src="/images/wizard/thumbnail_Frame.png"
        alt=""
      />
      <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl text-center">
        Ingresa tu industria
      </h1>
      <p className="text-base sm:text-lg text-center">Selecciona solo una opción</p>
      <CreatableSelect
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Selecciona el sector al que perteneces"
        enableAddItem={false}
      />
      <Select
        placeholder="Seleccionar región para establecer tu empresa"
        options={mapCatalogToOptions(region)}
        onChange={handleChange}
        value={state.regionSelected}
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

export default ConceptualizationWizardStep3;
