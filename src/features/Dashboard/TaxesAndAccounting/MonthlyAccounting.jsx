import React, { useEffect, useState } from 'react';
import RequiredDocumentTable from '../../../components/RequiredDocumentTable/RequiredDocumentTable';
import { useAccount } from '../../../hooks/useAccount';

export default function MonthlyAccounting() {
  const { activeCompanyInfo: { companyName } = {} } = useAccount();
  return (
    <div className="flex flex-col h-full w-full gap-5 pl-10 animate-slide-in mt-10">
      <h1 className="text-2xl text-black font-bold">{`Bienvenido ${companyName}`} </h1>
      <RequiredDocumentTable serviceId="accounting" />
    </div>
  );
}
