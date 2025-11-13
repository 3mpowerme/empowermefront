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
    <div className="fixed inset-0 z-20 w-full overflow-auto max-w-screen min-h-screen h-full flex flex-col bg-gradient-to-b from-[#FFFFFF] to-[#FDECDA] ">
      <div className="relative w-full">
        <span className="absolute left-18 top-5 text-xl font-bold text-black">
          {currentStep + 1}/{totalSteps}
        </span>

        <div className="flex w-full justify-center ">
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
      <div className="absolute w-10 top-10 right-5">
        <button className="p-0 border-0 cursor-pointer" onClick={onClose}>
          <X />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full py-10">
        <div className="flex flex-row flex-wrap gap-y-5 items-center">
          <div className="w-full flex flex-col space-y-2 p-5">
            <h1 className="font-bold text-2xl">{step?.title}</h1>
            <h2 className="font-semibold text-lg">{step?.subtitle}</h2>
            <p className="text-sm">{step?.description}</p>
          </div>

          <div className="w-1/2 h-full">
            <img className="w-4/5 m-auto" src={step.image} alt={step.title}></img>
            {step.footer && <div className="p-5 text-sm">{step.footer}</div>}
          </div>

          <div className="w-1/2 h-full">
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
