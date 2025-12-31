import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from '../../hooks/useAccount';
import WizardList from '../../components/WizardList/WizardList';
import Switch from '../../components/Switch/Switch';
import { useDashboard } from '../../hooks/useDashboard';
import PayBusinessCreation from '../../components/PayAndScheduleAppointment/PayBusinessCreation';
import { useRegisteredServies } from '../../hooks/useRegisteredServices';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_AND_SCHEDULE_APPOINTMENT_VIEW = 'pay-appointment-view';
const BUILD_COMPANY_VIEW = 'build-company-view';

export default function DashboardBuildCompanyPage() {
  const { activeCompanyInfo } = useAccount();
  const { companyName, info: { today_focus } = {} } = activeCompanyInfo;

  const { services, refetch } = useRegisteredServies('build_company');

  const { wizards: ws } = useDashboard();

  const [view, setView] = useState(LOADING_VIEW);
  const currentServiceOrderIdRef = useRef({ serviceOrderId: null, serviceType: null });
  const setServiceType = (st) => {
    currentServiceOrderIdRef.current.serviceType = st;
  };

  const mapWizards = (ws) => {
    return ws.map((w) => {
      w.onClick = (link) => {
        console.log('link', link);
        if (link === 'business_creation_wizard') {
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
  }, [ws]);

  useEffect(() => {
    setView(BUILD_COMPANY_VIEW);
  }, []);

  useEffect(() => {
    if (wizards.length > 0) {
      if (
        services?.paidServices?.['business_creation'] === false &&
        today_focus === 'Crea tu empresa'
      ) {
        setServiceType('business_creation');
        setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
      }
    }
  }, [wizards.length, services]);

  return (
    <>
      <Switch value={view}>
        <Switch.Item case={LOADING_VIEW}></Switch.Item>
        <Switch.Item case={ERROR_VIEW}></Switch.Item>
        <Switch.Item case={PAY_AND_SCHEDULE_APPOINTMENT_VIEW}>
          <PayBusinessCreation
            ref={currentServiceOrderIdRef}
            onComplete={() => {
              refetch().finally(() => setView(BUILD_COMPANY_VIEW));
            }}
          />
        </Switch.Item>
        <Switch.Item case={BUILD_COMPANY_VIEW}>
          <div className="flex flex-col h-full w-full gap-5 px-4 lg:px-10 animate-slide-in mt-10">
            <h1 className="text-2xl text-black font-bold">{`Bienvenido ${companyName}`} </h1>
            <h2 className="text-xl text-black font-bold">Creación de Empresa</h2>
            <WizardList wizards={wizards} services={services} />
          </div>
        </Switch.Item>
      </Switch>
    </>
  );
}
