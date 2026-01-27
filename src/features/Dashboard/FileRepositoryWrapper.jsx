import React, { useEffect, useRef, useState } from 'react';
import FileRepository from '../../components/FileRepository/FileRepository';
import { useAccount } from '../../hooks/useAccount';
import { Navigate, useParams } from 'react-router';
import { useService } from '../../hooks/useService';
import { privateService } from '../../services/privateService';
import Button from '../../components/Button/Button';
import CalendlyPopup from '../../components/CalendlyPopup/CalendlyPopup';

export default function FileRepositoryWrapper({ parentPath }) {
  const ALLOWED_SERVICES = [
    'business_creation',
    'business_orientation',
    'shareholders_registry',
    'personalized_advice',
    'personalized_advisory', // this is the used one
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
    'ordinary_shareholders_meeting',
  ];
  const { serviceId } = useParams();
  const {
    activeCompanyInfo: { companyName } = {},
    activeCompany: companyId,
    account: { email = '' } = {},
  } = useAccount();

  const { data: service } = useService(serviceId);
  const [eventIsScheduled, setEventIsScheduled] = useState(false);
  const [showCalendlyPopup, setShowCalendlyPopup] = useState(false);
  const serviceOrderRef = useRef({ serviceOrderId: null });

  const fetchAppointments = () => {
    privateService.get(`/intakes/appointments/${companyId}/${serviceId}`).then((appointments) => {
      if (appointments.length > 0) {
        const [appointment] = appointments;
        serviceOrderRef.current.serviceOrderId = appointment?.service_order;
        if (appointment?.appointment_status) setEventIsScheduled(true);
      }
    });
  };

  useEffect(() => {
    console.log('service', service);
    if (service.requires_appointment === 1) {
      fetchAppointments();
    }
  }, [service?.requires_appointment]);

  if (!ALLOWED_SERVICES.includes(serviceId)) {
    return <Navigate to={`/dashboard/${parentPath}`} replace />;
  }

  const handleScheduleAppointment = (e) => {
    fetchAppointments();
  };

  return (
    <div className="flex flex-col h-full w-full gap-5 pl-3 pr-3 md:pl-10 md:pr-10 animate-slide-in mt-10">
      <h1 className="text-2xl text-black font-bold">{`Bienvenido ${companyName}`} </h1>
      {service.requires_appointment === 1 && !eventIsScheduled && (
        <div className="">
          <Button
            onClick={() => {
              setShowCalendlyPopup(true);
            }}>
            Tienes una cita por agendar
          </Button>
        </div>
      )}
      {showCalendlyPopup && (
        <CalendlyPopup
          onEventScheduled={handleScheduleAppointment}
          user={{ email }}
          ref={serviceOrderRef}
          // TODO remove hardcode 30min
          url={service.appointment_url}
        />
      )}
      <FileRepository serviceId={serviceId} />
    </div>
  );
}
