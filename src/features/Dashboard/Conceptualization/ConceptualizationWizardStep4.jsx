import React, { useEffect } from 'react';
import { useConceptualization } from '../../../hooks/useConceptualization';
import FullScreenSpinner from '../../../components/FullScreenSpinner/FullScreenSpinner';
import MarketAnalysis from '../../../features/Dashboard/Conceptualization/MarketAnalysis';
import { useApp } from '../../../hooks/useApp';

const ConceptualizationWizardStep4 = () => {
  const { setStepState, state: { marketAnalysis, isLoading } = {} } = useConceptualization();
  const { setToast } = useApp();

  useEffect(() => {
    setStepState(4, { canContinue: true });
  }, []);

  useEffect(() => {
    let fired = false;

    const handleScroll = () => {
      if (fired) return;
      if (isLoading) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;

      if (scrollPosition >= pageHeight - 10) {
        fired = true;
        setToast({
          show: true,
          message: 'Ahora vamos a crear tu marca. dale click al botón continuar',
          type: 'success',
          button: {},
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setToast, isLoading]);

  return (
    <>
      {isLoading && (
        <FullScreenSpinner
          message="Generando análisis de viabilidad de tu negocio"
          showProgress
          duration={40 * 1000} // 40 seconds
        />
      )}
      {!isLoading && <MarketAnalysis data={marketAnalysis} />}
    </>
  );
};

export default ConceptualizationWizardStep4;
