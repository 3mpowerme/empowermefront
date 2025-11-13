import React from 'react';
import Button from '../Button/Button';

export default function Navigation({
  stepId,
  totalSteps,
  currentStep,
  setCurrentStep,
  finishLabel = 'Finalizar',
}) {
  const goNext = () => {
    const formSubmit = document.getElementById(`submit-${stepId}`);
    if (formSubmit) formSubmit.click();
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full flex justify-center gap-x-10 mt-20">
      {currentStep !== 0 && (
        <Button onClick={goBack} disabled={currentStep === 0}>
          Anterior
        </Button>
      )}

      {currentStep === totalSteps - 1 ? (
        <Button onClick={goNext}>{finishLabel}</Button>
      ) : (
        <Button onClick={goNext}>Continuar</Button>
      )}
    </div>
  );
}
