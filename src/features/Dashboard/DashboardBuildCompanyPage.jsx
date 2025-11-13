import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from '../../hooks/useAccount';
import WizardList from '../../components/WizardList/WizardList';
import Switch from '../../components/Switch/Switch';
import PayAndScheduleAppointment from '../../components/PayAndScheduleAppointment/PayAndScheduleAppointment';
import { useDashboard } from '../../hooks/useDashboard';
import { useAppointment } from '../../hooks/useAppointment';
import { normalizeAppointmentStatus } from '../../utils/utils';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_AND_SCHEDULE_APPOINTMENT_VIEW = 'pay-appointment-view';
const BUILD_COMPANY_VIEW = 'build-company-view';

export default function DashboardBuildCompanyPage() {
  const {
    activeCompanyInfo: { companyName },
  } = useAccount();

  const { wizards: ws } = useDashboard();

  const [view, setView] = useState(LOADING_VIEW);
  const currentServiceOrderIdRef = useRef({ serviceOrderId: null, serviceType: null });
  const setServiceType = (st) => {
    currentServiceOrderIdRef.current.serviceType = st;
  };

  const { appointment, refetch: appointmentRefetch } = useAppointment();

  const mapWizards = (ws) => {
    return ws.map((w) => {
      w.buttonType = undefined;
      const appointmentFiltered = appointment?.find((it) => {
        return w?.link?.includes(it?.service_code);
      });
      if (appointmentFiltered?.appointment_status === null) {
        w.buttonType = 'to-schedule';
        setServiceType(appointmentFiltered.service_code);
        currentServiceOrderIdRef.current.serviceOrderId = appointmentFiltered?.service_order_id;
        w.buttonCb = () => {
          setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        };
      }
      if (appointmentFiltered?.appointment_status) {
        w.buttonType = 'scheduled';
        w.buttonLabel = normalizeAppointmentStatus(appointmentFiltered?.appointment_status);
      }
      w.onClick = (link) => {
        console.log('link', link);
        if (link === 'setup_company_wizard') {
          setServiceType('business_creation');
          setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        }
      };
      return w;
    });
  };

  const wizards = useMemo(() => {
    if (!Array.isArray(ws)) return [];
    return mapWizards(ws);
  }, [ws, appointment]);

  useEffect(() => {
    setView(BUILD_COMPANY_VIEW);
  }, []);

  return (
    <>
      <Switch value={view}>
        <Switch.Item case={LOADING_VIEW}></Switch.Item>
        <Switch.Item case={ERROR_VIEW}></Switch.Item>
        <Switch.Item case={PAY_AND_SCHEDULE_APPOINTMENT_VIEW}>
          <PayAndScheduleAppointment
            ref={currentServiceOrderIdRef}
            onComplete={() => {
              appointmentRefetch().finally(() => setView(BUILD_COMPANY_VIEW));
            }}
          />
        </Switch.Item>
        <Switch.Item case={BUILD_COMPANY_VIEW}>
          <div className="flex flex-col h-full w-full gap-5 px-4 lg:px-10 animate-slide-in mt-10">
            <h1 className="text-2xl text-black font-bold">{`Bienvenido ${companyName}`} </h1>
            <h2 className="text-xl text-black font-bold">Creación de Empresa</h2>
            <WizardList wizards={wizards} />
          </div>
        </Switch.Item>
      </Switch>
    </>
  );
}
