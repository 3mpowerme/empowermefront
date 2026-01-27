import React, { useEffect, useState } from 'react';
import CardSelector from '../../components/CardSelector/CardSelector';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import { useTodayFocus } from '../../hooks/useTodayFocus';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../utils/storage';
import { useCustomEvent } from '../../hooks/useCustomEvent';

const BuildCompanyWizardStep2 = () => {
  const { setStepState } = useBuildCompany();
  const { todayFocus, isLoading } = useTodayFocus();
  const [showErrors, setShowErrors] = useState(false);

  const buildCompanyFromStorage = storage.getItem('buildCompany') || {};
  const { step2: { todayFocus: todayFocusFromStorage } = {} } = buildCompanyFromStorage;

  const [selected, setSelected] = useState(todayFocusFromStorage || []);
  const handleCardChange = (ids) => {
    setSelected(ids);
    setShowErrors(false);
  };

  useEffect(() => {
    const canContinue = Array.isArray(selected) ? selected.length > 0 : !!selected;
    setStepState(2, { todayFocus: selected, canContinue });
  }, [selected]);

  useCustomEvent('cannot-continue', () => {
    setShowErrors(true);
  });

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  const hasError = showErrors && (!Array.isArray(selected) || selected.length === 0);

  return (
    <div className="flex flex-col items-center w-full px-4 sm:px-6 md:px-10 lg:px-16 py-5 gap-8">
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
          initialValues={selected}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
        />
        {hasError && (
          <p className="mt-3 text-sm text-red-600 text-center">
            Selecciona al menos una opción para continuar.
          </p>
        )}
      </div>
    </div>
  );
};

export default BuildCompanyWizardStep2;
