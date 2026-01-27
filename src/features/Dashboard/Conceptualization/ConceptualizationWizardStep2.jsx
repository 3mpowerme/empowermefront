import React, { useRef, useState } from 'react';
import FullScreenSpinner from '../../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../../utils/storage';
import { useOfferingServiceType } from '../../../hooks/useOfferingServiceType';
import ListSelector from '../../../components/ListSelector/ListSelector';
import { useConceptualization } from '../../../hooks/useConceptualization';
import { addIconsToOfferingServiceType } from '../../../utils/catalogs';
import { useCustomEvent } from '../../../hooks/useCustomEvent';

const ConceptualizationWizardStep2 = () => {
  const currentOptionRef = useRef({});
  const { setStepState } = useConceptualization();
  const [error, setError] = useState('');

  const conceptualizationFromStorage = storage.getItem('conceptualization') || {};
  const { step2: { offeringServiceType: offeringServiceTypeFromStorage } = {} } =
    conceptualizationFromStorage;

  const { offeringServiceType, isLoading: isLoadingOfferingServiceType } = useOfferingServiceType();

  const handleCardChangeCompanyOffering = (ids) => {
    currentOptionRef.current = {
      ...currentOptionRef.current,
      offeringServiceType: ids,
      canContinue: true,
    };
    setStepState(2, { ...currentOptionRef.current });
  };

  useCustomEvent('cannot-continue', () => {
    setError('Por favor elige una opción');
  });

  if (isLoadingOfferingServiceType) {
    return <FullScreenSpinner />;
  }

  return (
    <div className="flex flex-col items-center gap-y-5 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
      <div>
        <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl text-center mb-2">
          ¿Qué tipo de producto o servicio ofrece tu negocio (o tu idea de negocio)?
        </h1>
        <p className="text-base sm:text-lg text-center">Elige solo una opción</p>
      </div>
      <ListSelector
        initialValues={offeringServiceTypeFromStorage}
        items={addIconsToOfferingServiceType(offeringServiceType)}
        onChange={handleCardChangeCompanyOffering}
      />
      {error && <span className="text-red-700">{error}</span>}
    </div>
  );
};

export default ConceptualizationWizardStep2;
