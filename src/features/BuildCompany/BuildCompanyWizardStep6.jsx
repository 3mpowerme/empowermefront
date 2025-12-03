import React from 'react';
import CardSelector from '../../components/CardSelector/CardSelector';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import { storage } from '../../utils/storage';

const BuildCompanyWizardStep6 = () => {
  const { setStepState } = useBuildCompany();
  const buildCompanyFromStorage = storage.getItem('buildCompany') || {};
  const { step6: { hasEmployees: hasEmployeesFromStorage } = {} } = buildCompanyFromStorage;

  const cards = [
    { id: 'SI', name: 'Sí', image: '/images/has_employees/si.png' },
    { id: 'NO', name: 'No', image: '/images/has_employees/no.png' },
    { id: 'NOT_SURE', name: 'No estoy seguro', image: '/images/has_employees/not_sure.png' },
  ];

  const handleCardChange = (ids) => {
    setStepState(6, { hasEmployees: ids, canContinue: true });
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-14 md:py-20 flex flex-col items-center gap-8">
      <div className="max-w-3xl text-center">
        <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl text-black">
          ¿Estás planeando contratar o cuentas con empleados?
        </h1>
      </div>

      <div className="w-full max-w-5xl">
        <CardSelector
          columns={3}
          cards={cards}
          onCardChange={handleCardChange}
          initialValues={hasEmployeesFromStorage}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
        />
      </div>
    </div>
  );
};

export default BuildCompanyWizardStep6;
