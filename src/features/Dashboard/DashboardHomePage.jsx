import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useAccount } from '../../hooks/useAccount';
import WizardList from '../../components/WizardList/WizardList';
import { Diamond } from 'lucide-react';
import { storage } from '../../utils/storage';
import { useDashboard } from '../../hooks/useDashboard';
import Switch from '../../components/Switch/Switch';
import { useCommercialMovement } from '../../hooks/useCommercialMovement';
import { useRegisteredServies } from '../../hooks/useRegisteredServices';
import PayMonthlyAccounting from '../../components/PayAndScheduleAppointment/PayMonthlyAccounting';
import PayBalance from '../../components/PayAndScheduleAppointment/PayBalance';
import PayBusinessCreation from '../../components/PayAndScheduleAppointment/PayBusinessCreation';
import MonthlyAccountingWizard from './TaxesAndAccounting/Wizards/MonthlyAccountingWizard';
import BalanceWizard from './TaxesAndAccounting/Wizards/BalanceWizard';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_AND_SCHEDULE_APPOINTMENT_VIEW = 'pay-appointment-view';
const HOME_VIEW = 'legal-services-view';
const ACCOUNTING_WIZARD_VIEW = 'accounting-wizard-view';
const BALANCE_WIZARD_VIEW = 'balance-wizard-view';

export default function DashboardHomePage() {
  const {
    activeCompanyInfo: { companyName, createdAt, info: { hasStartedActivities } = {} } = {},
    account: { email = '' } = {},
    activeCompany: companyId,
  } = useAccount();
  console.log('hasStartedActivities', hasStartedActivities);
  const { commercialMovement } = useCommercialMovement();
  const currentServiceOrderIdRef = useRef({ serviceOrderId: null, serviceType: null });

  const [serviceType, setServiceType] = useState('');
  const { services, refetch } = useRegisteredServies('home');
  const mapWizards = (ws) => {
    return ws.map((w) => {
      w.onClick = (link, alreadyRegistered, needsDocuments) => {
        console.log('link', link);
        if (link === 'accounting_wizard') {
          const info = storage.getItem(`wizard_form/monthly-accounting/${companyId}`) || {};
          storage.setItem(`wizard_form/monthly-accounting/${companyId}`, {
            ...info,
            email,
            company_name: companyName,
          });
          setServiceType('accounting');
          setView(alreadyRegistered ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW : ACCOUNTING_WIZARD_VIEW);
          //setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        }
        if (link === 'balance_wizard') {
          const info = storage.getItem(`wizard_form/company-balance-request/${companyId}`) || {};
          storage.setItem(`wizard_form/company-balance-request/${companyId}`, {
            ...info,
            contact_person_email: email,
            company_name: companyName,
          });
          setServiceType('balance');
          //setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
          setView(alreadyRegistered ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW : BALANCE_WIZARD_VIEW);
        }
        if (link === 'business_creation_wizard') {
          setServiceType('business_creation');
          setView(
            alreadyRegistered
              ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW
              : PAY_AND_SCHEDULE_APPOINTMENT_VIEW
          );
        }
      };

      return w;
    });
  };

  const { wizards: ws } = useDashboard();
  const [view, setView] = useState(LOADING_VIEW);

  const wizards = useMemo(() => {
    if (!Array.isArray(ws)) return [];

    return mapWizards([...ws]);
  }, [ws]);

  useEffect(() => {
    setView(HOME_VIEW);
  }, []);

  const handleWizardSuccess = (postId) => {
    currentServiceOrderIdRef.current.serviceOrderId = postId;
    handleWizardClose();
    setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
  };

  const handleWizardClose = () => {
    setView(HOME_VIEW);
  };

  const showPlan = false;

  return (
    <>
      <Switch value={view}>
        <Switch.Item case={LOADING_VIEW}></Switch.Item>
        <Switch.Item case={ERROR_VIEW}></Switch.Item>
        <Switch.Item case={PAY_AND_SCHEDULE_APPOINTMENT_VIEW}>
          <Switch value={serviceType}>
            <Switch.Item case="accounting">
              <PayMonthlyAccounting
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    setView(HOME_VIEW);
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="business_creation">
              <PayBusinessCreation
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => setView(HOME_VIEW));
                }}
              />
            </Switch.Item>
            <Switch.Item case="balance">
              <PayBalance
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    setView(HOME_VIEW);
                  });
                }}
              />
            </Switch.Item>
          </Switch>
        </Switch.Item>
        <Switch.Item case={ACCOUNTING_WIZARD_VIEW}>
          <MonthlyAccountingWizard
            hasStartedActivities={hasStartedActivities}
            commercialMovements={commercialMovement}
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={BALANCE_WIZARD_VIEW}>
          <BalanceWizard
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={HOME_VIEW}>
          <div className="flex flex-col h-full w-full gap-5 px-4 lg:px-10 animate-slide-in mt-10">
            <h1 className="text-2xl text-black font-bold">{`Bienvenido ${companyName}`} </h1>
            <div className="flex flex-row justify-between p-5 rounded-xl bg-black shadow-lg">
              <div className="flex flex-col">
                <p className="text-primary text-md font-bold">{companyName}</p>
                <p className="text-white text-sm">{`Formada: ${createdAt ? format(new Date(createdAt), 'dd/MM/yyyy') : ''}`}</p>
              </div>
              {showPlan && (
                <div className="flex flex-row space-x-2 items-center">
                  <p className="text-white text-sm">Plan</p>

                  <p className="text-white text-sm font-semibold bg-primary rounded-xl flex flex-row w-20 justify-center h-7 items-center">
                    Pro <Diamond className="ml-1" size={15} />
                  </p>
                </div>
              )}
            </div>
            <h2 className="text-xl text-black font-bold">Próximos pasos</h2>
            <WizardList wizards={wizards} services={services} />
            <h2 className="text-xl text-black font-bold">Estatus de tu empresa</h2>
            <div className="border rounded-xl border-opaque shadow-lg w-full h-50 flex justify-center items-center text-secondary mb-5">
              Proximamente...
            </div>
          </div>
        </Switch.Item>
      </Switch>
    </>
  );
}
