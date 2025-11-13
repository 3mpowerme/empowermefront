import React, { useEffect } from 'react';
import { useConceptualization } from '../../../hooks/useConceptualization';

const ConceptualizationWizardStep1 = () => {
  const { setStepState } = useConceptualization();

  useEffect(() => {
    setStepState(1, { canContinue: true });
  }, []);

  return (
    <div className="flex flex-col gap-y-10 items-center px-6 sm:px-10 md:px-20 lg:px-40 text-center">
      <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl">
        Bienvenido al asistente que te ayudara a conceptualizar tu negocio
      </h1>
      <p className="text-base sm:text-lg font-semibold">
        Te guiaremos paso a paso para que puedas obtener un análisis para ver la viabilidad de tu
        idea.
      </p>
      <img
        className="w-60 sm:w-70 max-w-full h-auto"
        src="/images/dashboard/conceptualization/concept.png"
        alt="Conceptualización"
      />
    </div>
  );
};

export default ConceptualizationWizardStep1;
