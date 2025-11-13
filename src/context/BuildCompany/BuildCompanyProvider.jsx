import { useState } from 'react';
import { BuildCompanyContext } from './BuildCompanyContext';
import { storage } from '../../utils/storage';

export function BuildCompanyProvider({ children }) {
  const buildCompanyFromStorage = storage.getItem('buildCompany');
  const { step0, step1, step2, step3, step4, step5, step6, step7, step8 } =
    buildCompanyFromStorage || {};
  const initialState = {
    step0: step0 ?? {},
    step1: step1 ?? {},
    step2: step2 ?? {},
    step3: step3 ?? {},
    step4: step4 ?? {},
    step5: step5 ?? {},
    step6: step6 ?? {},
    step7: step7 ?? {},
    step8: step8 ?? {},
  };
  const [state, setState] = useState(initialState);

  const setStepState = (stepNumber, newState = {}) => {
    setState((prevState) => {
      storage.setItem('buildCompany', {
        ...prevState,
        [`step${stepNumber}`]: { ...newState },
      });
      return {
        ...prevState,
        [`step${stepNumber}`]: { ...newState },
      };
    });
  };

  console.log('BuildCompanyProvider state:', state);

  return (
    <BuildCompanyContext.Provider value={{ state, setStepState }}>
      {children}
    </BuildCompanyContext.Provider>
  );
}
