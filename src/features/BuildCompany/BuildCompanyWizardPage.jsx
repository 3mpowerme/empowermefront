import React, { useEffect } from 'react';
import Wizard from '../../components/Wizard/Wizard';
import { useNavigate, useSearchParams } from 'react-router';
import BuildCompanyWizardStep1 from './BuildCompanyWizardStep1';
import BuildCompanyWizardStep2 from './BuildCompanyWizardStep2';
import BuildCompanyWizardStep3 from './BuildCompanyWizardStep3';
import BuildCompanyWizardStep4 from './BuildCompanyWizardStep4';
import BuildCompanyWizardStep5 from './BuildCompanyWizardStep5';
import BuildCompanyWizardStep6 from './BuildCompanyWizardStep6';
import BuildCompanyWizardStep7 from './BuildCompanyWizardStep7';
import BuildCompanyWizardStep8 from './BuildCompanyWizardStep8';
import BuildCompanyWizardStep9 from './BuildCompanyWizardStep9';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import globalConstants from '../../constants/global';

const BuildCompanyWizardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const name = searchParams.get('name');
  const { setStepState } = useBuildCompany();

  const steps = [
    { id: 1, component: <BuildCompanyWizardStep1 name={name} /> },
    { id: 2, component: <BuildCompanyWizardStep2 /> },
    { id: 3, component: <BuildCompanyWizardStep3 name={name} /> },
    { id: 4, component: <BuildCompanyWizardStep4 name={name} /> },
    { id: 5, component: <BuildCompanyWizardStep5 name={name} /> },
    { id: 6, component: <BuildCompanyWizardStep6 /> },
    { id: 7, component: <BuildCompanyWizardStep7 /> },
    { id: 8, component: <BuildCompanyWizardStep8 /> },
    { id: 9, component: <BuildCompanyWizardStep9 /> },
  ];

  const handleComplete = () => {
    navigate('/signup');
  };

  useEffect(() => {
    setStepState(0, { companyName: name, countryCode: globalConstants.countryCode });
  }, []);

  return (
    <Wizard
      withCanContinueBuildCompany
      steps={steps}
      onComplete={handleComplete}
      className="bg-gradient-to-b from-[#FFFFFF] to-[#FDECDA]"
    />
  );
};

export default BuildCompanyWizardPage;
