import React from 'react';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import { useDashboard } from '../../hooks/useDashboard';
import { useAccount } from '../../hooks/useAccount';

export default function DashboardGate({ children }) {
  const dashboard = useDashboard();
  const account = useAccount();

  const isReady = dashboard?.isReady && account?.isReady;

  if (!isReady) return <FullScreenSpinner />;

  return children;
}
