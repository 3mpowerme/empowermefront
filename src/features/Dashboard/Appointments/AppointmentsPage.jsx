import React, { useState } from 'react';
import Tabs from '../../../components/Tabs/Tabs';

import { useSearchParams } from 'react-router';
import { useAppointment } from '../../../hooks/useAppointment';
import AppointmentsTable from './AppointmentsTable';

export default function AppointmentsPage() {
  const { appointment: appointments, refetch } = useAppointment();
  const [searchParams] = useSearchParams();
  const sub = searchParams.get('sub');
  const tabs = [
    {
      id: 'scheduled',
      label: 'Agendadas',
      content: (
        <AppointmentsTable
          data={appointments.filter((it) => it.requires_appointment)}
          refetch={refetch}
        />
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col h-full w-full gap-5 pl-10 animate-slide-in mt-10">
        <h1 className="text-2xl text-black font-bold">Citas</h1>
        <Tabs tabs={tabs} initialTab={sub} />
      </div>
    </>
  );
}
