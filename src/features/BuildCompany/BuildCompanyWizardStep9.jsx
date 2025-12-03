import React from 'react';
import CardSelector from '../../components/CardSelector/CardSelector';
import { useMarketingSource } from '../../hooks/useMarketingSource';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../utils/storage';

const BuildCompanyWizardStep9 = () => {
  const { setStepState } = useBuildCompany();
  const { marketingSource, isLoading } = useMarketingSource();
  const buildCompanyFromStorage = storage.getItem('buildCompany') || {};
  const { step9: { marketingSource: marketingSourceFromStorage } = {} } = buildCompanyFromStorage;

  const handleCardChange = (ids) => {
    setStepState(9, { marketingSource: ids, canContinue: true });
  };

  if (isLoading) return <FullScreenSpinner />;

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 flex flex-col items-center gap-5">
      <img
        className="w-36 sm:w-44 md:w-56 h-auto"
        src="/images/wizard/thumbnail_Group-2.png"
        alt="Descubrimiento EmpowerMe"
      />
      <h1 className="text-center font-bold text-2xl sm:text-3xl md:text-4xl text-black max-w-3xl">
        ¿Cómo descubriste EmpowerMe?
      </h1>

      <div className="w-full max-w-5xl">
        <CardSelector
          multiple
          columns={4}
          cards={marketingSource}
          onCardChange={handleCardChange}
          initialValues={marketingSourceFromStorage}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        />
      </div>
    </div>
  );
};

export default BuildCompanyWizardStep9;
