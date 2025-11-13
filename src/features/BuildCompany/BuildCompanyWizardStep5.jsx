import React, { useEffect, useState } from 'react';
import { useRegion } from '../../hooks/useRegion';
import Select from '../../components/Select/Select';
import Input from '../../components/Input/Input';
import { mapCatalogToOptions } from '../../utils/catalogs';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import { storage } from '../../utils/storage';

const BuildCompanyWizardStep5 = ({ name }) => {
  const buildCompanyFromStorage = storage.getItem('buildCompany') || {};
  const {
    step5: {
      region_id: region_idFromStorage,
      street: streetFromStorage,
      zip_code: zip_codeFromStorage,
      phone_number: phone_numberFromStorage,
    } = {},
  } = buildCompanyFromStorage;

  const { region, isLoading } = useRegion();
  const { setStepState } = useBuildCompany();

  const [state, setState] = useState({
    regionSelected: region_idFromStorage ?? '',
    streetText: streetFromStorage ?? '',
    zipCodeText: zip_codeFromStorage ?? '',
    phoneNumberText: phone_numberFromStorage ?? '',
  });

  useEffect(() => {
    setStepState(5, {
      region_id: state.regionSelected,
      street: state.streetText,
      zip_code: state.zipCodeText,
      phone_number: state.phoneNumberText,
    });
  }, [state.regionSelected, state.streetText, state.zipCodeText, state.phoneNumberText]);

  const handleChange = (option) => {
    setState((prevState) => ({ ...prevState, regionSelected: option }));
  };

  if (isLoading) return <FullScreenSpinner />;

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-14 md:py-20 flex flex-col items-center gap-6 sm:gap-8">
      <img
        className="w-36 sm:w-44 md:w-56 h-auto"
        src="/images/wizard/thumbnail_Group.png"
        alt="Ubicación de operación"
      />
      <h1 className="text-center font-bold text-2xl sm:text-3xl md:text-4xl text-black max-w-3xl">
        ¿Desde dónde operará {name}?
      </h1>

      <div className="w-full max-w-2xl">
        <Select
          options={mapCatalogToOptions(region)}
          onChange={handleChange}
          value={state.regionSelected}
          placeholder="Selecciona una región"
        />
      </div>

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Input
          placeholder="Calle y número"
          value={state.streetText}
          onChange={(e) => setState((prev) => ({ ...prev, streetText: e.target.value }))}
        />
        <Input
          placeholder="Código Postal"
          value={state.zipCodeText}
          onChange={(e) => setState((prev) => ({ ...prev, zipCodeText: e.target.value }))}
        />
        <Input
          placeholder="Número de teléfono"
          value={state.phoneNumberText}
          onChange={(e) => setState((prev) => ({ ...prev, phoneNumberText: e.target.value }))}
          className="md:col-span-2"
        />
      </div>
    </div>
  );
};

export default BuildCompanyWizardStep5;
