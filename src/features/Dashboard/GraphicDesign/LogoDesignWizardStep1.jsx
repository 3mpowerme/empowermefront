import React, { useRef } from 'react';
import FullScreenSpinner from '../../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../../utils/storage';
import { useOfferingServiceType } from '../../../hooks/useOfferingServiceType';
import ListSelector from '../../../components/ListSelector/ListSelector';
import { useConceptualization } from '../../../hooks/useConceptualization';

const LogoDesignWizardStep1 = () => {
  const currentOptionRef = useRef({});
  const { setStepState } = useConceptualization();
  console.log('setStepState', setStepState);

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
    <div className="flex flex-col gap-y-10 items-center w-xl">
      <div>
        <h1 className="font-bold text-4xl text-center mb-2">
          ¿Qué tipo de producto o servicio ofrece tu negocio (o tu idea de negocio)?
        </h1>
        <p className="text-lg text-center">Elige solo una opción</p>
      </div>
      <ListSelector
        initialValues={offeringServiceTypeFromStorage}
        items={offeringServiceType}
        onChange={handleCardChangeCompanyOffering}
      />
    </div>
  );
};

export default LogoDesignWizardStep1;
