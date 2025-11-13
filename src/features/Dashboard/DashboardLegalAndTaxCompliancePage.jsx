import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';

export default function DashboardLegalAndTaxCompliancePage() {
  const { state: { user: { companyName = '' } = {} } = {} } = useDashboard();
  return (
    <div className="flex flex-col h-full w-full gap-5 pl-10">
      <h1 className="text-2xl text-black font-bold">{`Bienvenido ${companyName}`} </h1>
      <h2 className="text-xl text-black font-bold">Compliance</h2>
    </div>
  );
}
