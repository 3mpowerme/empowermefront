import { useContext } from 'react';
import { WizardContext } from '../context/WizardContext/WizardContext';

export const useWizard = () => useContext(WizardContext);
