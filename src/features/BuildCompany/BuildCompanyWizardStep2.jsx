import React from 'react';
import CardSelector from '../../components/CardSelector/CardSelector';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import { useTodayFocus } from '../../hooks/useTodayFocus';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../utils/storage';

const BuildCompanyWizardStep2 = () => {
  const { setStepState } = useBuildCompany();
  const { todayFocus, isLoading } = useTodayFocus();

  const buildCompanyFromStorage = storage.getItem('buildCompany') || {};
  const { step2: { todayFocus: todayFocusFromStorage } = {} } = buildCompanyFromStorage;

  const handleCardChange = (ids) => {
    setStepState(2, { todayFocus: ids });
  };

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  return (
    <div className="flex flex-col items-center w-full px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-14 md:py-20 gap-8">
      <div className="max-w-3xl text-center">
        <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-2 text-black">
          ¿Algo específico en lo que quieras enfocarte hoy?
        </h1>
        <p className="text-base sm:text-lg text-gray-700">Elige una de las opciones</p>
      </div>

      <div className="w-full max-w-5xl">
        <CardSelector
          columns={1}
          cards={todayFocus}
          onCardChange={handleCardChange}
          initialValues={todayFocusFromStorage}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
        />
      </div>
    </div>
  );
};

export default BuildCompanyWizardStep2;
