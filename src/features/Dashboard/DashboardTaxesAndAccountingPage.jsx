import React, { useEffect, useMemo, useRef, useState } from 'react';
import { privateService } from '../../services/privateService';
import WizardList from '../../components/WizardList/WizardList';
import { useAccount } from '../../hooks/useAccount';
import { useApp } from '../../hooks/useApp';
import Switch from '../../components/Switch/Switch';
import { useDashboard } from '../../hooks/useDashboard';
import PayAndScheduleAppointment from '../../components/PayAndScheduleAppointment/PayAndScheduleAppointment';
import { useCommercialMovement } from '../../hooks/useCommercialMovement';
import MonthlyAccountingWizard from './TaxesAndAccounting/Wizards/MonthlyAccountingWizard';
import AuditWizard from './TaxesAndAccounting/Wizards/AuditWizard';
import BalanceWizard from './TaxesAndAccounting/Wizards/BalanceWizard';
import StartActivitiesWizard from './TaxesAndAccounting/Wizards/StartActivitiesWizard';
import { storage } from '../../utils/storage';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_AND_SCHEDULE_APPOINTMENT_VIEW = 'pay-appointment-view';
const TAXES_AND_ACCOUNTING_VIEW = 'taxes-and-accounting-view';
const ACCOUNTING_WIZARD_VIEW = 'accounting-wizard-view';
const AUDIT_WIZARD_VIEW = 'audit-wizard-view';
const BALANCE_WIZARD_VIEW = 'balance-wizard-view';
const START_ACTIVITIES_WIZARD = 'start-activities-wizard';

export default function DashboardTaxesAndAccountingPage() {
  const { setIsLoading } = useApp();
  const {
    activeCompanyInfo: { companyName } = {},
    account: { email = '' } = {},
    activeCompany: companyId,
  } = useAccount();
  const { commercialMovement } = useCommercialMovement();
  const [view, setView] = useState(LOADING_VIEW);
  const currentServiceOrderIdRef = useRef({ serviceOrderId: null, serviceType: null });
  const setServiceType = (st) => {
    currentServiceOrderIdRef.current.serviceType = st;
  };

  const { wizards: ws } = useDashboard();

  const mapWizards = (ws) => {
    return ws.map((w) => {
      w.buttonType = undefined;
      w.onClick = (link) => {
        console.log('link', link);
        if (link === 'monthly_accounting_wizard') {
          const info = storage.getItem(`wizard_form/monthly-accounting/${companyId}`) || {};
          storage.setItem(`wizard_form/monthly-accounting/${companyId}`, {
            ...info,
            email,
            company_name: companyName,
          });
          setServiceType('accounting');
          setView(ACCOUNTING_WIZARD_VIEW);
          //setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        }

        if (link === 'tax_audit_wizard') {
          const info = storage.getItem(`wizard_form/company-audit-request/${companyId}`) || {};
          storage.setItem(`wizard_form/company-audit-request/${companyId}`, {
            ...info,
            contact_person_email: email,
            company_name: companyName,
          });
          setServiceType('audit');
          setView(AUDIT_WIZARD_VIEW);
        }
        if (link === 'balance_wizard') {
          const info = storage.getItem(`wizard_form/company-balance-request/${companyId}`) || {};
          storage.setItem(`wizard_form/company-balance-request/${companyId}`, {
            ...info,
            contact_person_email: email,
            company_name: companyName,
          });
          setServiceType('balance');
          setView(BALANCE_WIZARD_VIEW);
        }
        if (link === 'remunerations_wizard') {
          setServiceType('remunerations');
          setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        }
        if (link === 'tax_planning_wizard') {
          setServiceType('tax_planning');
          setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        }
        if (link === 'start_activities_wizard') {
          setServiceType('start_activities');
          setView(START_ACTIVITIES_WIZARD);
        }
      };
      console.log('w', w);
      return w;
    });
  };

  const wizards = useMemo(() => {
    if (!Array.isArray(ws)) return [];
    return mapWizards(ws);
  }, [ws]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const currentSubscription = await privateService.get(`/subscription/${companyId}`);
      console.log('currentSubscription', currentSubscription);
      setView(TAXES_AND_ACCOUNTING_VIEW);
    } catch (error) {
      console.error('Error getting data in taxes and accounting', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWizardSuccess = (postId) => {
    currentServiceOrderIdRef.current.serviceOrderId = postId;
    fetchData();
    handleWizardClose();
    setTimeout(() => {
      setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
    }, 200);
  };

  const handleWizardClose = () => {
    setView(TAXES_AND_ACCOUNTING_VIEW);
  };

  return (
    <>
      <Switch value={view}>
        <Switch.Item case={LOADING_VIEW}></Switch.Item>
        <Switch.Item case={ERROR_VIEW}></Switch.Item>
        <Switch.Item case={PAY_AND_SCHEDULE_APPOINTMENT_VIEW}>
          <PayAndScheduleAppointment
            ref={currentServiceOrderIdRef}
            onComplete={() => {
              fetchData().finally(() => setView(TAXES_AND_ACCOUNTING_VIEW));
            }}
          />
        </Switch.Item>
        <Switch.Item case={ACCOUNTING_WIZARD_VIEW}>
          <MonthlyAccountingWizard
            commercialMovements={commercialMovement}
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={START_ACTIVITIES_WIZARD}>
          <StartActivitiesWizard
            commercialMovements={commercialMovement}
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={AUDIT_WIZARD_VIEW}>
          <AuditWizard
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
        <Switch.Item case={TAXES_AND_ACCOUNTING_VIEW}>
          <div className="flex flex-col h-full w-full gap-5 px-4 lg:px-10 animate-slide-in mt-10">
            <h1 className="text-2xl text-black font-bold">{`Bienvenido ${companyName}`} </h1>
            <h2 className="text-xl text-black font-bold">Facturas y Contabilidad</h2>
            <WizardList wizards={wizards} />
          </div>
        </Switch.Item>
      </Switch>
    </>
  );
}
