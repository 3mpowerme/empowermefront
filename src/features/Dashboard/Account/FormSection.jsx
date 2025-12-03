import React, { useState } from 'react';
import { useShareholder } from '../../../hooks/useShareholder';
import CardSelector from '../../../components/CardSelector/CardSelector';
import { mapShareholdersToCards } from '../../../utils/catalogs';
import Button from '../../../components/Button/Button';
import { Minus, Plus } from 'lucide-react';
import { useApp } from '../../../hooks/useApp';
import StepForm from '../../../components/StepForm/StepForm';
import Navigation from '../../../components/WizardForm/Navigation';
import { WizardProvider } from '../../../context/WizardContext/WizardProvider';
import { useWizard } from '../../../hooks/useWizard';

export default function FormSection() {
  const { steps, currentStep, setCurrentStep, finish } = useWizard();
  const step = steps[currentStep];
  return (
    <div className="mt-5 w-full">
      <div className="flex flex-col w-full justify-end mb-5 space-x-2">
        <StepForm step={step} onStepSubmit={finish} />

        <Navigation
          totalSteps={steps.length}
          stepId={step.id}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          finishLabel="Guardar"
        />
      </div>
    </div>
  );
}
