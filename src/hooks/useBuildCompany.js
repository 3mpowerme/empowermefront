import { useContext } from 'react';
import { BuildCompanyContext } from '../context/BuildCompany/BuildCompanyContext';

export function useBuildCompany() {
  return useContext(BuildCompanyContext);
}
