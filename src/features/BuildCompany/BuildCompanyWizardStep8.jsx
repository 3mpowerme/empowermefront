import React, { useState } from 'react';
import CardSelector from '../../components/CardSelector/CardSelector';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import { storage } from '../../utils/storage';
import { useCustomEvent } from '../../hooks/useCustomEvent';

const BuildCompanyWizardStep8 = () => {
  const { setStepState } = useBuildCompany();
  const buildCompanyFromStorage = storage.getItem('buildCompany') || {};
  const { step8: { hasStartedActivities: hasStartedActivitiesFromStorage } = {} } =
    buildCompanyFromStorage;

  const [showErrors, setShowErrors] = useState(false);

  const cards = [
    { id: 'SI', name: 'Sí', image: '' },
    { id: 'NO', name: 'No', image: '' },
  ];

  const handleCardChange = (ids) => {
    setStepState(8, { hasStartedActivities: ids, canContinue: true });
  };

  useCustomEvent('cannot-continue', () => {
    setShowErrors(true);
  });

  const hasError = showErrors;

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-14 md:py-20 flex flex-col items-center gap-8">
      <img
        className="w-36 sm:w-44 md:w-56 h-auto"
        src="/images/wizard/thumbnail_Group-1.png"
        alt="Formalización de empresa"
      />
      <h1 className="text-center font-bold text-2xl sm:text-3xl md:text-4xl text-black max-w-3xl">
        ¿Iniciaste actividades en el Servicio de impuestos Interno (SII)?
      </h1>

      <div className="w-full max-w-3xl">
        <CardSelector
          columns={2}
          cards={cards}
          onCardChange={handleCardChange}
          initialValues={hasStartedActivitiesFromStorage}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        />
        {hasError && (
          <p className="mt-3 text-sm text-red-600 text-center">
            Selecciona una opción para continuar.
          </p>
        )}
      </div>
    </div>
  );
};

export default BuildCompanyWizardStep8;
