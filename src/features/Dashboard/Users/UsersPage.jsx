import React, { useState } from 'react';
import Tabs from '../../../components/Tabs/Tabs';

import { useSearchParams } from 'react-router';
import UsersTable from './UsersTable';

export default function UsersPage() {
  const [searchParams] = useSearchParams();
  const sub = searchParams.get('sub');
  const tabs = [
    {
      id: 'my-services',
      label: 'Mis Usuarios',
      content: <UsersTable />,
    },
  ];

  return (
    <>
      <div className="flex flex-col h-full w-full gap-5 px-10 animate-slide-in mt-10">
        <h1 className="text-2xl text-black font-bold">Usuarios</h1>
        <Tabs tabs={tabs} initialTab={sub} />
      </div>
    </>
  );
}
