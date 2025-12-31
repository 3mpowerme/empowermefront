import React from 'react';
import FileRepository from '../../components/FileRepository/FileRepository';
import { useAccount } from '../../hooks/useAccount';
import { Navigate, useParams } from 'react-router';

export default function FileRepositoryWrapper({ parentPath }) {
  const ALLOWED_SERVICES = [
    'business_creation',
    'business_orientation',
    'shareholders_registry',
    'personalized_advice',
    'personalized_advisory',
    'constitution_review',
    'dissolution_of_spa',
    'dissolution_of_eirl',
    'dissolution_of_srl',
    'accounting',
    'audit',
    'balance',
    'start_activities',
    'tax_planning',
    'remunerations',
    'virtual_office',
    'virtual_office_plus_ministorage',
    'company_modifications_spa',
    'company_modifications_srl',
  ];
  const { serviceId } = useParams();
  const { activeCompanyInfo: { companyName } = {} } = useAccount();

  if (!ALLOWED_SERVICES.includes(serviceId)) {
    return <Navigate to={`/dashboard/${parentPath}`} replace />;
  }

  return (
    <div className="flex flex-col h-full w-full gap-5 pl-3 pr-3 md:pl-10 md:pr-10 animate-slide-in mt-10">
      <h1 className="text-2xl text-black font-bold">{`Bienvenido ${companyName}`} </h1>
      <FileRepository serviceId={serviceId} />
    </div>
  );
}
