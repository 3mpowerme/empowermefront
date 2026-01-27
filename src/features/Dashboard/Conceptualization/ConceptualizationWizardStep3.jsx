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
import { useCustomEvent } from '../../../hooks/useCustomEvent';

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
  const [businessSectorOther, setBusinessSectorOther] = useState('');
  const { region, isLoading: isLoadingRegion } = useRegion();
  const options = mapCatalogToOptions(businessSectors);
  const { setStepState } = useConceptualization();
  const [state, setState] = useState({
    regionSelected: regionFromStorage,
  });
  const [error, setError] = useState({
    business_sectors: '',
    about: '',
    business_sector_other: '',
    region: '',
  });

  useEffect(() => {
    if (business_sectorsFromStorage) {
      const parsedId = Number(business_sectorsFromStorage);
      const isNumericId = !Number.isNaN(parsedId);
      if (!isNumericId) {
        setTimeout(() => {
          setStepState(3, {
            business_sectors: '',
            about: text,
            business_sector_other: '',
            region: state.regionSelected,
            canContinue: false,
          });
        }, 100);
      }
    }
  }, []);

  useEffect(() => {
    setStepState(3, {
      business_sectors: value,
      about: text,
      business_sector_other: businessSectorOther,
      region: state.regionSelected,
      canContinue: value && text && text.length > 9 && state.regionSelected,
    });
  }, [text, value, state.regionSelected]);

  useCustomEvent('cannot-continue', (data) => {
    const newError = { business_sectors: '', about: '', region: '' };
    if (data.about && data.about.length < 10) {
      newError.about = 'Por favor escribe una descripción de al menos 10 caracteres';
    }
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

  if (isLoadingBusinessSectors || isLoadingRegion) {
    return <FullScreenSpinner />;
  }

  const handleNewOptionAdded = (newOptionName) => {
    setBusinessSectorOther(newOptionName);
  };

  const handleChange = (option) => {
    setState((prevState) => ({ ...prevState, regionSelected: option }));
  };

  const handleBusinessSectorChange = (val) => {
    setValue(val);
    if (val && isNaN(Number(val))) {
      setBusinessSectorOther(val);
    } else {
      setBusinessSectorOther('');
    }
  };

  return (
    <div className="flex flex-col items-center gap-y-5 w-full max-w-3xl mx-auto px-4 sm:px-6">
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
        onChange={handleBusinessSectorChange}
        placeholder="Selecciona el sector al que perteneces"
        enableAddItem={true}
        onNewOptionAdded={handleNewOptionAdded}
      />
      {error.business_sectors && <span className="text-red-700">{error.business_sectors}</span>}
      <Select
        placeholder="Seleccionar región para establecer tu empresa"
        options={mapCatalogToOptions(region)}
        onChange={handleChange}
        value={state.regionSelected}
      />
      {error.region && <span className="text-red-700">{error.region}</span>}
      <TextArea
        id="aboutYou"
        name="aboutYou"
        placeholder="Cuéntanos brevemente tu negocio, siendo lo más específico posible. Nuestra IA evaluará la probabilidad de éxito de tu idea o negocio"
        maxLength={500}
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error.about && <span className="text-red-700">{error.about}</span>}
    </div>
  );
};

export default ConceptualizationWizardStep3;
