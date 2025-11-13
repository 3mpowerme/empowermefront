import React from 'react';
import CardSelector from '../../components/CardSelector/CardSelector';
import { useMarketingSource } from '../../hooks/useMarketingSource';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../utils/storage';

const BuildCompanyWizardStep8 = () => {
  const { setStepState } = useBuildCompany();
  const { marketingSource, isLoading } = useMarketingSource();
  const buildCompanyFromStorage = storage.getItem('buildCompany') || {};
  const { step8: { marketingSource: marketingSourceFromStorage } = {} } = buildCompanyFromStorage;

  const handleCardChange = (ids) => {
    setStepState(8, { marketingSource: ids });
  };

  if (isLoading) return <FullScreenSpinner />;

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-14 md:py-20 flex flex-col items-center gap-8">
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
          columns={2}
          cards={marketingSource}
          onCardChange={handleCardChange}
          initialValues={marketingSourceFromStorage}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        />
      </div>
    </div>
  );
};

export default BuildCompanyWizardStep8;
