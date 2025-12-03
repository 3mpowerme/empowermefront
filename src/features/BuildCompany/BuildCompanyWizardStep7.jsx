import React from 'react';
import CardSelector from '../../components/CardSelector/CardSelector';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import { storage } from '../../utils/storage';

const BuildCompanyWizardStep7 = () => {
  const { setStepState } = useBuildCompany();
  const buildCompanyFromStorage = storage.getItem('buildCompany') || {};
  const { step7: { isRegisteredCompany: isRegisteredCompanyFromStorage } = {} } =
    buildCompanyFromStorage;

  const cards = [
    { id: 'SI', name: 'Sí', image: '' },
    { id: 'NO', name: 'No', image: '' },
  ];

  const handleCardChange = (ids) => {
    setStepState(7, { isRegisteredCompany: ids, canContinue: true });
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-10 md:py-10 flex flex-col items-center gap-8">
      <img
        className="w-36 sm:w-44 md:w-56 h-auto"
        src="/images/wizard/thumbnail_Group-1.png"
        alt="Formalización de empresa"
      />
      <h1 className="text-center font-bold text-2xl sm:text-3xl md:text-4xl text-black max-w-3xl">
        ¿Está formalizado como empresa?
      </h1>
      <p className="text-center text-base sm:text-lg text-secondary max-w-4xl leading-relaxed px-4">
        Estar formalizado como empresa significa que creaste una persona jurídica con un RUT
        diferente al tuyo para iniciar actividades ante el Servio de Impuestos Interno (SII)
      </p>

      <div className="w-full max-w-3xl">
        <CardSelector
          columns={2}
          cards={cards}
          onCardChange={handleCardChange}
          initialValues={isRegisteredCompanyFromStorage}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        />
      </div>
    </div>
  );
};

export default BuildCompanyWizardStep7;
