import React from 'react';
import { useWizard } from '../../hooks/useWizard';
import StepForm from '../StepForm/StepForm';
import Navigation from './Navigation';
import { X } from 'lucide-react';

export default function WizardForm({ onClose = () => {} }) {
  const { steps, currentStep, setCurrentStep, finish } = useWizard();
  const totalSteps = steps?.length;
  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-20 w-full overflow-auto max-w-screen min-h-screen h-full flex flex-col bg-gradient-to-b from-[#FFFFFF] to-[#FDECDA]">
      <div className="relative w-full">
        <span className="absolute left-4 top-4 text-lg font-bold text-black md:left-18 md:top-5 md:text-xl">
          {currentStep + 1}/{totalSteps}
        </span>

        <div className="flex w-full justify-center">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-2 transition ${
                idx <= currentStep ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-3 right-3 md:w-10 md:top-10 md:right-5">
        <button className="p-0 border-0 cursor-pointer" onClick={onClose}>
          <X />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start md:justify-center w-full py-6 md:py-10">
        <div className="w-full flex flex-col gap-y-6 items-stretch px-4 md:px-0 md:flex-row md:flex-wrap md:gap-y-5 md:items-center">
          <div className="w-full flex flex-col space-y-2 p-0 md:p-5">
            <h1 className="font-bold text-xl md:text-2xl">{step?.title}</h1>
            <h2 className="font-semibold text-base md:text-lg">{step?.subtitle}</h2>
            <p className="text-sm">{step?.description}</p>
          </div>

          <div className="w-full md:w-1/2 h-full">
            <img
              className="w-full max-w-sm mx-auto md:w-4/5 md:m-auto"
              src={step.image}
              alt={step.title}
            />
            {step.footer && <div className="p-0 mt-3 text-sm md:p-5 md:mt-0">{step.footer}</div>}
          </div>

          <div className="w-full md:w-1/2 h-full">
            <StepForm
              step={step}
              onStepSubmit={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  finish();
                }
              }}
            />
          </div>
        </div>

        <Navigation
          totalSteps={steps.length}
          stepId={step.id}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          step={step}
        />
      </div>
    </div>
  );
}
