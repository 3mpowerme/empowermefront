import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { privateService } from '../../../services/privateService';
import WizardList from '../../../components/WizardList/WizardList';
import { WizardProvider } from '../../../context/WizardContext/WizardProvider';
import WizardForm from '../../../components/WizardForm/WizardForm';
import { useShareholder } from '../../../hooks/useShareholder';
import global from '../../../constants/global';
import { useAccount } from '../../../hooks/useAccount';
import { storage } from '../../../utils/storage';
import { useApp } from '../../../hooks/useApp';
import Switch from '../../../components/Switch/Switch';
import { normalizeAppointmentStatus } from '../../../utils/utils';
import PayAndScheduleAppointment from '../../../components/PayAndScheduleAppointment/PayAndScheduleAppointment';
import { useDashboard } from '../../../hooks/useDashboard';
import { useAppointment } from '../../../hooks/useAppointment';
import ConstitutionReviewWizard from './Wizards/ConstitutionReviewWizard';
import ShareholdersRegistryWizard from './Wizards/ShareholdersRegistryWizard';
import DissolutionOfSpaWizard from './Wizards/DissolutionOfSpaWizard';
import DissolutionOfEirlWizard from './Wizards/DissolutionOfEirlWizard';
import DissolutionOfSrlWizard from './Wizards/DissolutionOfSrlWizard';
import PayDissolutionOfSrl from '../../../components/PayAndScheduleAppointment/PayDissolutionOfSrl';
import PayDissolutionOfEirl from '../../../components/PayAndScheduleAppointment/PayDissolutionOfEirl';
import PayDissolutionOfSpa from '../../../components/PayAndScheduleAppointment/PayDissolutionOfSpa';
import { useRegisteredServies } from '../../../hooks/useRegisteredServices';
import PayShareholdersRegistry from '../../../components/PayAndScheduleAppointment/PayShareholdersRegistry';
import PayConstitutionReview from '../../../components/PayAndScheduleAppointment/PayConstitutionReview';
import PayOrdinaryShareholderMeeting from '../../../components/PayAndScheduleAppointment/PayOrdinaryShareholderMeeting';
import OrdinaryShareholdersMeetingWizard from './Wizards/OrdinaryShareholdersMeetingWizard';
import PayCompanyModificationsSpa from '../../../components/PayAndScheduleAppointment/PayCompanyModificationsSpa';
import PayCompanyModificationsSrl from '../../../components/PayAndScheduleAppointment/PayCompanyModificationsSrl';
import CompanyModificationsSpaWizard from './Wizards/CompanyModificationsSpaWizard';
import CompanyModificationsSrlWizard from './Wizards/CompanyModificationsSrlWizard';
import PayPersonalizedAdvisory from '../../../components/PayAndScheduleAppointment/PayPersonalizedAdvisory';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_AND_SCHEDULE_APPOINTMENT_VIEW = 'pay-appointment-view';
const LEGAL_SERVICES_VIEW = 'legal-services-view';
const WIZARD_VIEW = 'wizard-view';
const DISSOLUTION_OF_SPA_WIZARD_VIEW = 'dissolution-of-spa-wizard-view';
const DISSOLUTION_OF_EIRL_WIZARD_VIEW = 'dissolution-of-eirl-wizard-view';
const DISSOLUTION_OF_SRL_WIZARD_VIEW = 'dissolution-of-srl-wizard-view';
const CONSTITUTION_REVIEW_WIZARD_VIEW = 'constitution-review-wizard-view';
const SHAREHOLDERS_REGISTRY_WIZARD_VIEW = 'shareholders-registry-wizard-view';
const ORDINDARY_SHAREHOLDERS_MEETING_WIZARD_VIEW = 'ordinary-shareholders-meeting-wizard-view';
const COMPANY_MODIFICATIONS_SRL_WIZARD_VIEW = 'company-modifications-srl-wizard-view';
const COMPANY_MODIFICATIONS_SPA_WIZARD_VIEW = 'company-modifications-spa-wizard-view';

export default function LegalServicesPage() {
  const { setIsLoading, setToast } = useApp();
  const {
    activeCompanyInfo: { companyName } = {},
    account: { email = '' } = {},
    activeCompany: companyId,
  } = useAccount();
  const navigate = useNavigate();

  const companyTaxInfoRef = useRef({});

  const [view, setView] = useState(LOADING_VIEW);

  const currentServiceOrderIdRef = useRef({ serviceOrderId: null, serviceType: null });
  const [serviceType, setServiceType] = useState('');

  const { wizards: ws } = useDashboard();

  const { services, refetch } = useRegisteredServies('legal_services');
  console.log('HERE services', services);

  const mapWizards = (ws) => {
    return ws.map((w) => {
      w.onClick = (link, alreadyRegistered, needsDocuments) => {
        console.log('link', link);
        if (link === 'shareholders_registry_wizard') {
          const info =
            storage.getItem(`wizard_form/shareholders-registry-request/${companyId}`) || {};
          storage.setItem(`wizard_form/shareholders-registry-request/${companyId}`, {
            ...info,
            //contact_person_email: email,
            company_name: companyName,
          });
          setServiceType('shareholders_registry');
          setView(
            alreadyRegistered
              ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW
              : SHAREHOLDERS_REGISTRY_WIZARD_VIEW
          );
        }
        if (link === 'constitution_review_wizard') {
          const info =
            storage.getItem(`wizard_form/constitution-review-request/${companyId}`) || {};
          storage.setItem(`wizard_form/constitution-review-request/${companyId}`, {
            ...info,
            //contact_person_email: email,
            company_name: companyName,
          });

          setServiceType('constitution_review');
          setView(
            alreadyRegistered ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW : CONSTITUTION_REVIEW_WIZARD_VIEW
          );
        }
        if (link === 'dissolution_of_spa_wizard') {
          const info =
            storage.getItem(`wizard_form/dissolution-request/${companyId}/dissolution_of_spa`) ||
            {};
          storage.setItem(`wizard_form/dissolution-request/${companyId}/dissolution_of_spa`, {
            ...info,
            //contact_person_email: email,
            company_name: companyName,
          });
          setServiceType('dissolution_of_spa');
          setView(
            alreadyRegistered ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW : DISSOLUTION_OF_SPA_WIZARD_VIEW
          );
        }
        if (link === 'dissolution_of_eirl_wizard') {
          const info =
            storage.getItem(`wizard_form/dissolution-request/${companyId}/dissolution_of_eirl`) ||
            {};
          storage.setItem(`wizard_form/dissolution-request/${companyId}/dissolution_of_eirl`, {
            ...info,
            //contact_person_email: email,
            company_name: companyName,
          });

          setServiceType('dissolution_of_eirl');
          setView(
            alreadyRegistered ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW : DISSOLUTION_OF_EIRL_WIZARD_VIEW
          );
        }
        if (link === 'dissolution_of_srl_wizard') {
          const info =
            storage.getItem(`wizard_form/dissolution-request/${companyId}/dissolution_of_srl`) ||
            {};
          storage.setItem(`wizard_form/dissolution-request/${companyId}/dissolution_of_srl`, {
            ...info,
            //contact_person_email: email,
            company_name: companyName,
          });
          setServiceType('dissolution_of_srl');
          setView(
            alreadyRegistered ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW : DISSOLUTION_OF_SRL_WIZARD_VIEW
          );
        }
        if (link === 'personalized_advisory_wizard') {
          setServiceType('personalized_advice');
          currentServiceOrderIdRef.current.serviceOrderId = null;
          setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        }
        if (link === 'ordinary_shareholders_meeting_wizard') {
          setServiceType('ordinary_shareholders_meeting');
          currentServiceOrderIdRef.current.serviceOrderId = null;
          setView(
            alreadyRegistered
              ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW
              : ORDINDARY_SHAREHOLDERS_MEETING_WIZARD_VIEW
          );
        }
        if (link === 'company_modifications_spa_wizard') {
          setServiceType('company_modifications_spa');
          currentServiceOrderIdRef.current.serviceOrderId = null;
          setView(
            alreadyRegistered
              ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW
              : COMPANY_MODIFICATIONS_SPA_WIZARD_VIEW
          );
        }
        if (link === 'company_modifications_srl_wizard') {
          setServiceType('company_modifications_srl');
          currentServiceOrderIdRef.current.serviceOrderId = null;
          setView(
            alreadyRegistered
              ? PAY_AND_SCHEDULE_APPOINTMENT_VIEW
              : COMPANY_MODIFICATIONS_SRL_WIZARD_VIEW
          );
        }
      };

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

      setView(LEGAL_SERVICES_VIEW);
    } catch (error) {
      console.error('Error getting data in legal services', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWizardClose = () => {
    setView(LEGAL_SERVICES_VIEW);
  };

  const handleWizardSuccess = (postId) => {
    currentServiceOrderIdRef.current.serviceOrderId = postId;
    handleWizardClose();
    setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
  };
  return (
    <>
      <Switch value={view}>
        <Switch.Item case={LOADING_VIEW}></Switch.Item>
        <Switch.Item case={ERROR_VIEW}></Switch.Item>
        <Switch.Item case={PAY_AND_SCHEDULE_APPOINTMENT_VIEW}>
          <Switch value={serviceType}>
            <Switch.Item case="personalized_advisory">
              <PayPersonalizedAdvisory
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(LEGAL_SERVICES_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="dissolution_of_spa">
              <PayDissolutionOfSpa
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(LEGAL_SERVICES_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="dissolution_of_eirl">
              <PayDissolutionOfEirl
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(LEGAL_SERVICES_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="dissolution_of_srl">
              <PayDissolutionOfSrl
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(LEGAL_SERVICES_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="shareholders_registry">
              <PayShareholdersRegistry
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(LEGAL_SERVICES_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="constitution_review">
              <PayConstitutionReview
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(LEGAL_SERVICES_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="ordinary_shareholders_meeting">
              <PayOrdinaryShareholderMeeting
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(LEGAL_SERVICES_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="company_modifications_spa">
              <PayCompanyModificationsSpa
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(LEGAL_SERVICES_VIEW));
                  });
                }}
              />
            </Switch.Item>
            <Switch.Item case="company_modifications_srl">
              <PayCompanyModificationsSrl
                ref={currentServiceOrderIdRef}
                onComplete={() => {
                  refetch().finally(() => {
                    fetchData().finally(() => setView(LEGAL_SERVICES_VIEW));
                  });
                }}
              />
            </Switch.Item>
          </Switch>
        </Switch.Item>
        <Switch.Item case={SHAREHOLDERS_REGISTRY_WIZARD_VIEW}>
          <ShareholdersRegistryWizard
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={ORDINDARY_SHAREHOLDERS_MEETING_WIZARD_VIEW}>
          <OrdinaryShareholdersMeetingWizard
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={CONSTITUTION_REVIEW_WIZARD_VIEW}>
          <ConstitutionReviewWizard
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={DISSOLUTION_OF_SPA_WIZARD_VIEW}>
          <DissolutionOfSpaWizard
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={DISSOLUTION_OF_EIRL_WIZARD_VIEW}>
          <DissolutionOfEirlWizard
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={DISSOLUTION_OF_SRL_WIZARD_VIEW}>
          <DissolutionOfSrlWizard
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={COMPANY_MODIFICATIONS_SPA_WIZARD_VIEW}>
          <CompanyModificationsSpaWizard
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={COMPANY_MODIFICATIONS_SRL_WIZARD_VIEW}>
          <CompanyModificationsSrlWizard
            companyId={companyId}
            handleWizardClose={handleWizardClose}
            handleWizardSuccess={handleWizardSuccess}
          />
        </Switch.Item>
        <Switch.Item case={LEGAL_SERVICES_VIEW}>
          <div className="flex flex-col h-full w-full gap-5 px-4 lg:px-10 animate-slide-in mt-10">
            <h1 className="text-2xl text-black font-bold">{`Bienvenido ${companyName}`} </h1>
            <h2 className="text-xl text-black font-bold">Servicios Legales</h2>
            <WizardList wizards={wizards} services={services} />
          </div>
        </Switch.Item>
      </Switch>
    </>
  );
}
