import React, { useState } from 'react';

import { useParams } from 'react-router';
import FileRepository from '../../../components/FileRepository/FileRepository';

export default function RepositoryPage() {
  const { serviceId, companyId } = useParams();

  return (
    <div className="flex flex-col h-full w-full gap-5 pl-3 pr-3 md:pl-10 md:pr-10 animate-slide-in mt-10">
      <FileRepository serviceId={serviceId} companyId={companyId} isExecutive />
    </div>
  );
}
