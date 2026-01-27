import React, { useState } from 'react';
import Tabs from '../../../components/Tabs/Tabs';

import { useSearchParams } from 'react-router';
import ServicesTable from './ServicesTable';

export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const sub = searchParams.get('sub');
  const tabs = [
    {
      id: 'my-services',
      label: 'Mis servicios',
      content: <ServicesTable />,
    },
  ];

  return (
    <>
      <div className="flex flex-col h-full w-full gap-5 px-10 animate-slide-in mt-10">
        <h1 className="text-2xl text-black font-bold">Mis servicios</h1>
        <Tabs tabs={tabs} initialTab={sub} />
      </div>
    </>
  );
}
