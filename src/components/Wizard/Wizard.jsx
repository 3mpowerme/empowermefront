import { useState } from 'react';
import Button from '../Button/Button';
import classNames from 'classnames';
import { useConceptualization } from '../../hooks/useConceptualization';
import { X } from 'lucide-react';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import { dispatchCustomEvent } from '../../utils/utils';

const WizardButtons = ({
  className,
  isLastStep,
  isFirstStep,
  shouldShowPreviousStep,
  prevStep,
  nextStep,
  firstStepButtonText,
  lastStepButtonText,
  onComplete,
}) => {
  console.log('isLastStep', isLastStep);
  return (
    <div className={className}>
      {!isFirstStep && shouldShowPreviousStep && (
        <Button
          onClick={prevStep}
          disabled={isFirstStep}
          className="w-full sm:w-auto justify-center">
          Anterior
        </Button>
      )}
      {!isLastStep ? (
        <Button
          id="wizard-continue-button"
          onClick={nextStep}
          className="w-full sm:w-auto justify-center">
          {(isFirstStep && firstStepButtonText) || 'Continuar'}
        </Button>
      ) : (
        <Button onClick={onComplete} className="w-full sm:w-auto justify-center">
          {lastStepButtonText || 'Finalizar'}
        </Button>
      )}
    </div>
  );
};

export default function Wizard({
  steps,
  onComplete,
  className,
  firstStepButtonText,
  lastStepButtonText,
  showProgress = true,
  onContinue = () => {},
  hidePreviousStepInStep = [],
  withCanContinue = false,
  withCanContinueBuildCompany = false,
  onClose,
  lastStepOnTheTop = false,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const { state = {} } = useConceptualization();
  const { state: buildCompanyState = {} } = useBuildCompany();
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const nextStep = () => {
    onContinue(currentStep + 1);
    if (withCanContinueBuildCompany) {
      if (buildCompanyState[`step${currentStep + 1}`]?.canContinue) {
        if (!isLastStep) setCurrentStep(currentStep);
      } else {
        dispatchCustomEvent('cannot-continue', state[`step${currentStep + 1}`]);
        return;
      }
    }
    if (withCanContinue) {
      console.log('HERE currentStep', currentStep);
      console.log('HERE state', state);
      if (state[`step${currentStep + 1}`]?.canContinue) {
        if (!isLastStep) setCurrentStep((prev) => prev + 1);
      } else {
        dispatchCustomEvent('cannot-continue', state[`step${currentStep + 1}`]);
      }
    } else if (!isLastStep) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (!isFirstStep) setCurrentStep((prev) => prev - 1);
  };
  const activeStep = currentStep + 1;
  const activeStepInStepsToHide = hidePreviousStepInStep.find((it) => it === activeStep);
  const shouldShowPreviousStep = !activeStepInStepsToHide;

  return (
    <div className={classNames('max-w-screen min-h-screen h-auto flex flex-col', className)}>
      {showProgress && (
        <div className="relative w-full">
          <span className="absolute sm:left-18 left-2 top-2 sm:top-5 text-xl font-bold text-black">
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
      )}
      {lastStepOnTheTop && isLastStep && (
        <WizardButtons
          className={
            'flex flex-col sm:flex-row gap-2 sm:gap-6 sm:justify-end justify-center sm:pr-20 sm:w-full z-50 sm:relative fixed sm:top-10 bottom-5 sm:right-0 right-25'
          }
          isFirstStep={isFirstStep}
          shouldShowPreviousStep={shouldShowPreviousStep}
          prevStep={prevStep}
          nextStep={nextStep}
          firstStepButtonText={firstStepButtonText}
          lastStepButtonText={lastStepButtonText}
          onComplete={onComplete}
          isLastStep={isLastStep}
        />
      )}
      {onClose && (
        <div className="absolute w-10 top-15 right-5 sm:top-20 sm:right-30 z-50">
          <button className="p-0 border-0 cursor-pointer" onClick={onClose}>
            <X />
          </button>
        </div>
      )}

      <div className="flex-1 w-full flex flex-col items-center justify-center py-5">
        <div className="max-w-6xl mx-auto">
          {steps[currentStep].component}

          <WizardButtons
            className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center mx-5 mt-5 sm:mt-5"
            isFirstStep={isFirstStep}
            shouldShowPreviousStep={shouldShowPreviousStep}
            prevStep={prevStep}
            nextStep={nextStep}
            firstStepButtonText={firstStepButtonText}
            lastStepButtonText={lastStepButtonText}
            onComplete={onComplete}
            isLastStep={isLastStep}
          />
        </div>
      </div>
    </div>
  );
}
