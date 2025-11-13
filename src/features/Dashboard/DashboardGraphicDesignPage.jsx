import React from 'react';
import { useAccount } from '../../hooks/useAccount';

export default function DashboardGraphicDesignPage() {
  const {
    activeCompanyInfo: { companyName },
  } = useAccount();
  return (
    <div className="flex flex-col h-full w-full gap-5 pl-10">
      <h1 className="text-2xl text-black font-bold">{`Bienvenido ${companyName}`} </h1>
      <h2 className="text-xl text-black font-bold">Diseño Gráfico</h2>
    </div>
  );
}
