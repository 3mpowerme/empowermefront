import React, { useEffect } from 'react';
import { useConceptualization } from '../../../hooks/useConceptualization';
import FullScreenSpinner from '../../../components/FullScreenSpinner/FullScreenSpinner';
import MarketAnalysis from '../../../features/Dashboard/Conceptualization/MarketAnalysis';

const ConceptualizationWizardStep4 = () => {
  const { setStepState, state: { marketAnalysis, isLoading } = {} } = useConceptualization();
  useEffect(() => {
    setStepState(4, { canContinue: true });
  }, []);
  return (
    <>
      {isLoading && (
        <FullScreenSpinner
          message="Generando análisis de tu negocio"
          showProgress
          duration={40 * 1000} // 40 seconds
        />
      )}
      {!isLoading && <MarketAnalysis data={marketAnalysis} />}
    </>
  );
};

export default ConceptualizationWizardStep4;
