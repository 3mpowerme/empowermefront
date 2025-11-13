import { useContext } from 'react';
import { DashboardContext } from '../context/Dashboard/DashboardContext';

export function useDashboard() {
  return useContext(DashboardContext);
}
