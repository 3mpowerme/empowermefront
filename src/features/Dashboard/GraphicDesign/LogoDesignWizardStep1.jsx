import React, { useRef } from 'react';
import FullScreenSpinner from '../../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../../utils/storage';
import { useOfferingServiceType } from '../../../hooks/useOfferingServiceType';
import ListSelector from '../../../components/ListSelector/ListSelector';
import { useConceptualization } from '../../../hooks/useConceptualization';

const LogoDesignWizardStep1 = () => {
  const currentOptionRef = useRef({});
  const { setStepState } = useConceptualization();

  const logoDesignFromStorage = storage.getItem('logo_design') || {};
  const { step1: { offeringServiceType: offeringServiceTypeFromStorage } = {} } =
    logoDesignFromStorage;

  const { offeringServiceType, isLoading: isLoadingOfferingServiceType } = useOfferingServiceType();

  const handleCardChangeCompanyOffering = (ids) => {
    currentOptionRef.current = {
      ...currentOptionRef.current,
      offeringServiceType: ids,
      canContinue: true,
    };
    setStepState(1, { ...currentOptionRef.current });
  };

  if (isLoadingOfferingServiceType) {
    return <FullScreenSpinner />;
  }

  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-10 flex justify-center">
      <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl flex flex-col gap-y-6 sm:gap-y-10 items-stretch sm:items-center">
        <div className="w-full">
          <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-center mb-2">
            ¿Qué tipo de producto o servicio ofrece tu negocio (o tu idea de negocio)?
          </h1>
          <p className="text-base sm:text-lg text-center">Elige solo una opción</p>
        </div>

        <div className="w-full">
          <ListSelector
            initialValues={offeringServiceTypeFromStorage}
            items={offeringServiceType}
            onChange={handleCardChangeCompanyOffering}
          />
        </div>
      </div>
    </div>
  );
};

export default LogoDesignWizardStep1;
