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
import { useRegisteredServies } from '../../hooks/useRegisteredServices';
import PayMonthlyAccounting from '../../components/PayAndScheduleAppointment/PayMonthlyAccounting';
import PayBalance from '../../components/PayAndScheduleAppointment/PayBalance';
import PayAudit from '../../components/PayAndScheduleAppointment/PayAudit';
import PayTaxPlanning from '../../components/PayAndScheduleAppointment/PayTaxPlanning';
import VirtualOfficeWizard from './TaxesAndAccounting/Wizards/VirtualOfficeWizard';
import PayVirtualOffice from '../../components/PayAndScheduleAppointment/PayVirtualOffice';
import PayVirtualOfficePlusMiniStorage from '../../components/PayAndScheduleAppointment/PayVirtualOfficePlusMiniStorage';
import PayStartActivities from '../../components/PayAndScheduleAppointment/PayStartActivities';
import { prefillInfoIfExist } from '../../utils/utils';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_AND_SCHEDULE_APPOINTMENT_VIEW = 'pay-appointment-view';
const TAXES_AND_ACCOUNTING_VIEW = 'taxes-and-accounting-view';
const ACCOUNTING_WIZARD_VIEW = 'accounting-wizard-view';
const AUDIT_WIZARD_VIEW = 'audit-wizard-view';
const BALANCE_WIZARD_VIEW = 'balance-wizard-view';
const VIRTUAL_OFFICE_WIZARD_VIEW = 'virtual-office-wizard-view';
const VIRTUAL_OFFICE_PLUS_MINISTORAGE_WIZARD_VIEW = 'virtual-office-plus-ministorage-wizard-view';
const START_ACTIVITIES_WIZARD = 'start-activities-wizard';

export default function DashboardTaxesAndAccountingPage() {
  const { setIsLoading } = useApp();
  const {
    activeCompanyInfo: { companyName, info: { hasStartedActivities } = {} } = {},
    account: { email = '' } = {},
    activeCompany: companyId,
  } = useAccount();

  const { commercialMovement } = useCommercialMovement();
  const [view, setView] = useState(LOADING_VIEW);
  const currentServiceOrderIdRef = useRef({ serviceOrderId: null, serviceType: null });
  const [serviceType, setServiceType] = useState('');

  const { wizards: ws } = useDashboard();
  const { services, refetch } = useRegisteredServies('invoice_and_accounting');
  const mapWizards = (ws) => {
    return ws.map((w) => {
      w.buttonType = undefined;
      w.onClick = async (link, alreadyRegistered, needsDocuments) => {
        console.log('link', link);
        console.log('companyId', companyId);
        if (link === 'accounting_wizard') {
          await prefillInfoIfExist(`wizard_form/monthly-accounting/${companyId}`, companyId, {
            email: email,
            company_contact_email: email,
            company_name: companyName,
          });

          setServiceType('accounting');
          setView(alreadyRegistered ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW : ACCOUNTING_WIZARD_VIEW);
          //setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        }

        if (link === 'audit_wizard') {
          await prefillInfoIfExist(`wizard_form/company-audit-request/${companyId}`, companyId, {
            contact_person_email: email,
            company_name: companyName,
          });

          setServiceType('audit');
          //setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
          setView(alreadyRegistered ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW : AUDIT_WIZARD_VIEW);
        }
        if (link === 'balance_wizard') {
          await prefillInfoIfExist(`wizard_form/company-balance-request/${companyId}`, companyId, {
            contact_person_email: email,
            company_name: companyName,
          });

          setServiceType('balance');
          //setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
          setView(alreadyRegistered ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW : BALANCE_WIZARD_VIEW);
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
          await prefillInfoIfExist(
            `wizard_form/company-start-activities-request/${companyId}`,
            companyId,
            {
              contact_person_email: email,
              company_name: companyName,
            }
          );
          setServiceType('start_activities');
          setView(alreadyRegistered ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW : START_ACTIVITIES_WIZARD);
        }
        if (link === 'virtual_office_wizard') {
          await prefillInfoIfExist(
            `wizard_form/virtual-office-request/${companyId}/virtual_office`,
            companyId,
            {
              company_name: companyName,
            },
            ['company_name', 'company_tax_id']
          );
          setServiceType('virtual_office');
          setView(
            alreadyRegistered ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW : VIRTUAL_OFFICE_WIZARD_VIEW
          );
        }
        if (link === 'virtual_office_plus_ministorage_wizard') {
          await prefillInfoIfExist(
            `wizard_form/virtual-office-request/${companyId}/virtual_office_plus_ministorage`,
            companyId,
            {
              company_name: companyName,
            },
            ['company_name', 'company_tax_id']
          );
          setServiceType('virtual_office_plus_ministorage');
          setView(
            alreadyRegistered
              ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW
              : VIRTUAL_OFFICE_PLUS_MINISTORAGE_WIZARD_VIEW
          );
        }
        if (link === 'personalized_advisory_wizard') {
          setServiceType('personalized_advisory');
          setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        }
      };
      console.log('w', w);
      return w;
    });
  };

  const wizards = useMemo(() => {
    if (!Array.isArray(ws)) return [];
    return mapWizards(
      ws.filter((it) => {
        if (hasStartedActivities === 'SI') {
          return it.link !== 'start_activities_wizard';
        }
        return it;
      })
    );
  }, [ws, hasStartedActivities]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
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
          <Switch value={serviceType}>
            <Switch.Item case="accounting">
              <PayMonthlyAccounting
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(TAXES_AND_ACCOUNTING_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="start_activities">
              <PayStartActivities
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(TAXES_AND_ACCOUNTING_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="audit">
              <PayAudit
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(TAXES_AND_ACCOUNTING_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="balance">
              <PayBalance
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(TAXES_AND_ACCOUNTING_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="tax_planning">
              <PayTaxPlanning
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(TAXES_AND_ACCOUNTING_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="virtual_office">
              <PayVirtualOffice
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(TAXES_AND_ACCOUNTING_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="virtual_office_plus_ministorage">
              <PayVirtualOfficePlusMiniStorage
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(TAXES_AND_ACCOUNTING_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="personalized_advisory">
              <PayTaxPlanning
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(TAXES_AND_ACCOUNTING_VIEW));
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
        <Switch.Item case={START_ACTIVITIES_WIZARD}>
          <StartActivitiesWizard
            commercialMovements={commercialMovement}
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={VIRTUAL_OFFICE_WIZARD_VIEW}>
          <VirtualOfficeWizard
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
            serviceCode="virtual_office"
          />
        </Switch.Item>
        <Switch.Item case={VIRTUAL_OFFICE_PLUS_MINISTORAGE_WIZARD_VIEW}>
          <VirtualOfficeWizard
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
            serviceCode="virtual_office_plus_ministorage"
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
            <WizardList wizards={wizards} services={services} />
          </div>
        </Switch.Item>
      </Switch>
    </>
  );
}
