import React, { useEffect } from 'react';
import Wizard from '../../components/Wizard/Wizard';
import { useNavigate, useSearchParams } from 'react-router';

import { useBuildCompany } from '../../hooks/useBuildCompany';
import globalConstants from '../../constants/global';
import ConceptualizationWizardStep2 from '../Dashboard/Conceptualization/ConceptualizationWizardStep2';
import ConceptualizationWizardStep3 from '../Dashboard/Conceptualization/ConceptualizationWizardStep3';
import ConceptualizationWizardStep4 from '../Dashboard/Conceptualization/ConceptualizationWizardStep4';
import ConceptualizationWizardStep1 from '../Dashboard/Conceptualization/ConceptualizationWizardStep1';

const StartConceptualizationPage = () => {
  const navigate = useNavigate();

  const steps = [
    { id: 1, component: <ConceptualizationWizardStep1 withAutoContinue /> },
    { id: 2, component: <ConceptualizationWizardStep2 /> },
    { id: 3, component: <ConceptualizationWizardStep3 /> },
    { id: 4, component: <ConceptualizationWizardStep4 showTemplate /> },
  ];

  const handleComplete = () => {
    navigate('/signup', { state: { from: 'conceptualization' } });
  };

  return (
    <Wizard
      withCanContinue
      steps={steps}
      lastStepButtonText="Desbloquear"
      onComplete={handleComplete}
      className="bg-gradient-to-b from-[#FFFFFF] to-[#FDECDA]"
      lastStepOnTheTop
    />
  );
};

export default StartConceptualizationPage;
