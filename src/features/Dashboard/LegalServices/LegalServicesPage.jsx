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

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_AND_SCHEDULE_APPOINTMENT_VIEW = 'pay-appointment-view';
const LEGAL_SERVICES_VIEW = 'legal-services-view';
const WIZARD_VIEW = 'wizard-view';

export default function LegalServicesPage() {
  const { setIsLoading, setToast } = useApp();
  const { activeCompanyInfo: { companyName } = {}, activeCompany: companyId } = useAccount();
  const navigate = useNavigate();
  const { hasShareholders, refetch, shareholders } = useShareholder();
  const companyTaxInfoRef = useRef({});
  const [state, setState] = useState({
    currentWizardConfig: null,
    globalAPI: '',
    successMessage: '',
    errorMessage: 'La solicitud no pudo ser procesada',
    successButton: {},
    onlyCreate: false,
  });
  const {
    currentWizardConfig,
    globalAPI,
    successMessage,
    errorMessage,
    successButton,
    onlyCreate,
  } = state;
  const [view, setView] = useState(LOADING_VIEW);

  const currentServiceOrderIdRef = useRef({ serviceOrderId: null, serviceType: null });
  const setServiceType = (st) => {
    currentServiceOrderIdRef.current.serviceType = st;
  };

  const { appointment, refetch: appointmentRefetch } = useAppointment();

  const getHasShareholders = () => storage.getItem('hasShareholders');

  const { wizards: ws } = useDashboard();

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
        console.log('getHasShareholders()', getHasShareholders());

        const hasCompanyInfo = Object.keys(companyTaxInfoRef.current).length > 0;
        let sub;
        if (!hasCompanyInfo) {
          sub = 'tax-info';
        }

        if (!hasCompanyInfo) {
          const button = {
            message: 'Completar',
            onClick: () => {
              setToast({
                show: false,
                message: '',
                type: '',
                button: {},
              });
              navigate(`/dashboard/account?sub=${sub}`);
            },
          };
          setToast({
            show: true,
            message: 'Debes tener completo tu perfil tributario para continuar',
            type: 'success',
            button,
          });
          return;
        }
        console.log('link', link);
        const shareholder_ids = shareholders.map((it) => it.id);
        if (getHasShareholders() == false) {
          const openShareholderWizard = () => {
            setState((prevState) => ({
              ...prevState,
              currentWizardConfig: getShareholderWizardConfig(),
              globalAPI: `/company-shareholder/${companyId}`,
              successMessage: 'El socio/accionista se guardó correctamente, ¿Quieres agregar otro?',
              successButton: {
                message: 'Agregar',
                onClick: () => {
                  setView(WIZARD_VIEW);
                  openShareholderWizard();
                },
              },
              onlyCreate: true,
            }));
          };

          openShareholderWizard();
          setView(WIZARD_VIEW);
          return;
        }
        if (link === 'shareholders_registry_wizard') {
          const currentInfo =
            storage.getItem(`wizard_form/company-shareholders-registry-request/${companyId}`) ?? {};
          storage.setItem(`wizard_form/company-shareholders-registry-request/${companyId}`, {
            ...currentInfo,
            company_name: companyTaxInfoRef.current?.business_name,
            company_rut: companyTaxInfoRef.current?.rut,
            shareholder_ids,
          });
          setState((prevState) => ({
            ...prevState,
            currentWizardConfig: getShareholdersRegistryWizardConfig(),
            globalAPI: `/company-shareholders-registry-request/${companyId}`,
            successMessage: 'La solicitud para registro de accionistas se envío correctamente',
            successButton: {},
            onlyCreate: true,
          }));
          setServiceType('shareholders_registry');
          setView(WIZARD_VIEW);
        }
        if (link === 'constitution_review_wizard') {
          const currentInfo =
            storage.getItem(`wizard_form/company-constitution-review-request/${companyId}`) ?? {};
          storage.setItem(`wizard_form/company-constitution-review-request/${companyId}`, {
            ...currentInfo,
            company_name: companyTaxInfoRef.current?.business_name,
            company_rut: companyTaxInfoRef.current?.rut,
            shareholder_ids,
          });
          setState((prevState) => ({
            ...prevState,
            currentWizardConfig: getConstitutionReviewWizardConfig(),
            globalAPI: `/company-constitution-review-request/${companyId}`,
            successMessage:
              'La solicitud de revisión de constitución de Empresa se envío correctamente',
            successButton: {},
            onlyCreate: true,
          }));
          setServiceType('constitution_review');
          setView(WIZARD_VIEW);
        }
        if (link === 'dissolution_of_spa_wizard') {
          const currentInfo =
            storage.getItem(`wizard_form/company-dissolution-of-spa-request/${companyId}`) ?? {};
          storage.setItem(`wizard_form/company-dissolution-of-spa-request/${companyId}`, {
            ...currentInfo,
            company_name: companyTaxInfoRef.current?.business_name,
            company_rut: companyTaxInfoRef.current?.rut,
            shareholder_ids,
          });
          setState((prevState) => ({
            ...prevState,
            currentWizardConfig: getDissolutionOfSpaWizardConfig(),
            globalAPI: `/company-dissolution-of-spa-request/${companyId}`,
            successMessage: 'La solicitud para disolución SPA se envio correctamente',
            successButton: {},
            onlyCreate: true,
          }));
          setServiceType('dissolution_of_spa');
          setView(WIZARD_VIEW);
        }
        if (link === 'dissolution_of_eirl_wizard') {
          const currentInfo =
            storage.getItem(`wizard_form/company-dissolution-of-eirl-request/${companyId}`) ?? {};
          storage.setItem(`wizard_form/company-dissolution-of-eirl-request/${companyId}`, {
            ...currentInfo,
            company_name: companyTaxInfoRef.current?.business_name,
            company_rut: companyTaxInfoRef.current?.rut,
            shareholder_ids,
          });
          setState((prevState) => ({
            ...prevState,
            currentWizardConfig: getDissolutionOfEirlWizardConfig(),
            globalAPI: `/company-dissolution-of-eirl-request/${companyId}`,
            successMessage: 'La solicitud para disolución EIRL se envio correctamente',
            successButton: {},
            onlyCreate: true,
          }));
          setServiceType('dissolution_of_eirl');
          setView(WIZARD_VIEW);
        }
        if (link === 'dissolution_of_srl_wizard') {
          const currentInfo =
            storage.getItem(`wizard_form/company-dissolution-of-srl-request/${companyId}`) ?? {};
          storage.setItem(`wizard_form/company-dissolution-of-srl-request/${companyId}`, {
            ...currentInfo,
            company_name: companyTaxInfoRef.current?.business_name,
            company_rut: companyTaxInfoRef.current?.rut,
            shareholder_ids,
          });
          setState((prevState) => ({
            ...prevState,
            currentWizardConfig: getDissolutionOfSrlWizardConfig(),
            globalAPI: `/company-dissolution-of-srl-request/${companyId}`,
            successMessage: 'La solicitud para disolución SRL se envio correctamente',
            successButton: {},
            onlyCreate: true,
          }));
          setServiceType('dissolution_of_srl');
          setView(WIZARD_VIEW);
        }
        if (link === 'personalized_advisory_wizard') {
          setServiceType('personalized_advice');
          currentServiceOrderIdRef.current.serviceOrderId = null;
          setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        }
      };

      return w;
    });
  };

  const wizards = useMemo(() => {
    if (!Array.isArray(ws)) return [];
    return mapWizards(ws);
  }, [ws, appointment, shareholders]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const companyTaxInfoResponse = await privateService.get(`/company-tax-info/${companyId}`);
      companyTaxInfoRef.current = companyTaxInfoResponse;
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

  const getShareholderWizardConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Pasos para agregar un accionista/socio a tu empresa',
        subtitle: 'Complete toda la información solicitada',
        description:
          'Para poder realizar las siguientes solicitudes necesitas tener registrado al menos un accionista/socio',
        image: '/images/dashboard/legal_services/shareholders_registry_1.png',
        fields: [
          {
            name: 'type',
            label: 'Elige si es socio o accionista*',
            placeHolder: 'Elige una opción',
            type: 'select',
            options: [
              { value: 'SOCIO', label: 'Socio' },
              { value: 'ACCIONISTA', label: 'Accionista' },
            ],
            required: true,
          },
          {
            name: 'full_name',
            label: 'Nombre de socio/accionista*',
            placeHolder: 'Ingresa el nombre de socio/accionista',
            type: 'text',
            required: true,
          },
          {
            name: 'rut',
            label: 'RUT de socio/accionista*',
            placeHolder: 'Ingresa el RUT de socio/accionista',
            type: 'text',
            required: true,
          },
          {
            name: 'address',
            label: 'Dirección de socio/accionista*',
            placeHolder: 'Ingresa la dirección de socio/accionista',
            type: 'text',
            required: true,
          },
          {
            name: 'phone',
            label: 'Teléfono de socio/accionista*',
            placeHolder: 'Ingresa el teléfono de socio/accionista',
            type: 'text',
            required: true,
          },
          {
            name: 'profession',
            label: 'Profesión de socio/accionista*',
            placeHolder: 'Ingresa la profesión de socio/accionista',
            type: 'text',
            required: true,
          },
          {
            name: 'email',
            label: 'Correo electrónico de socio/accionista*',
            placeHolder: 'Ingresa correo electrónico de socio/accionista',
            type: 'email',
            required: true,
          },
          {
            name: 'nationality',
            label: 'Nacionalidad de socio/accionista*',
            placeHolder: 'Ingresa correo electrónico de socio/accionista',
            type: 'select',
            options: global.nationalityOptions,
            required: true,
          },
          {
            name: 'unique_key',
            label: 'Clave única de socio/accionista*',
            placeHolder: 'Ingresa la clave única de socio/accionista',
            type: 'text',
            required: true,
          },
        ],
      },
    ];
  };

  const getShareholdersRegistryWizardConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para registro de accionistas',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Necesitas realizar la apertura de libro para una Sociedad por Acciones para cumplir con las obligaciones emanadas de la entrada en vigencia de la ley 20.659? En EmpowerMe podemos ayudarte, revisa los detalles y contrata 100% online.',
        footer:
          'Para realizar el proceso se requiere OBLIGATORIAMENTE ingresar a www.registrodeempresasysociedades.cl con rut y clave única de uno de los accionistas de la empresa. Sugerimos que antes de ingresarla, verifiques que es correcta en: https://claveunica.gob.cl/ Si la empresa tiene más de 1 representante legal, basta con 1, recuerde que un socio o accionista de una empresa NO necesariamente es el representante legal.',
        image: '/images/dashboard/legal_services/shareholders_registry_2.png',
        fields: [
          {
            name: 'company_name',
            label: 'Razón Social de la Empresa*',
            placeHolder: 'Ingresa Razón Social de la Empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'company_rut',
            label: 'RUT de la empresa*',
            placeHolder: 'Ingresa RUT de la Empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'shareholder_ids',
            label: 'Socios/accionistas*',
            type: 'shareholders',
            shareholders,
            disabled: true,
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Información para registro de accionistas',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Necesitas realizar la apertura de libro para una Sociedad por Acciones para cumplir con las obligaciones emanadas de la entrada en vigencia de la ley 20.659? En EmpowerMe podemos ayudarte, revisa los detalles y contrata 100% online.',
        image: '/images/dashboard/legal_services/shareholders_registry_3.png',
        fields: [
          {
            name: 'contact_name',
            label: 'Nombre persona de contacto para el proceso*',
            placeHolder: 'Ingresa nombre de persona de contacto',
            type: 'text',
            required: true,
          },
          {
            name: 'contact_email',
            label: 'Correo persona de contacto para el proceso*',
            placeHolder: 'Ingresa correo electrónico de persona de contacto',
            type: 'email',
            required: true,
          },
          {
            name: 'contact_phone',
            label: 'Teléfono personal persona de contacto para el proceso*',
            placeHolder: 'Ingresa móvil de persona de contacto',
            type: 'text',
            required: true,
          },
        ],
      },
    ];
  };

  const getConstitutionReviewWizardConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para revisión de Constitución de Empresas',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Quieres saber si tu empresa está bien constituida y no tendrá problemas para operar formalmente? En EmpowerMe ofrecemos servicio de revisión de los estatutos de tu empresa (exclusivo para empresas constituidas en www.registrodemempresasysociedades.cl o Empresaen1día, si creaste tu empresa con el sistema tradicional en papel no realizamos este tipo de revisiones).',
        image: '/images/dashboard/legal_services/constitution_review_1.png',
        fields: [
          {
            name: 'company_name',
            label: 'Razón Social de la Empresa*',
            placeHolder: 'Ingresa Razón Social de la Empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'company_rut',
            label: 'RUT de la empresa*',
            placeHolder: 'Ingresa RUT de la Empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'shareholder_ids',
            label: 'Socios/accionistas*',
            type: 'shareholders',
            shareholders,
            disabled: true,
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Información para revisión de Constitución de Empresas',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Quieres saber si tu empresa está bien constituida y no tendrá problemas para operar formalmente? En EmpowerMe ofrecemos servicio de revisión de los estatutos de tu empresa (exclusivo para empresas constituidas en www.registrodemempresasysociedades.cl o Empresaen1día, si creaste tu empresa con el sistema tradicional en papel no realizamos este tipo de revisiones).',
        image: '/images/dashboard/legal_services/constitution_review_2.png',
        fields: [
          {
            name: 'contact_name',
            label: 'Nombre persona de contacto para el proceso*',
            placeHolder: 'Ingresa nombre de persona de contacto',
            type: 'text',
            required: true,
          },
          {
            name: 'contact_email',
            label: 'Correo persona de contacto para el proceso*',
            placeHolder: 'Ingresa correo electrónico de persona de contacto',
            type: 'email',
            required: true,
          },
          {
            name: 'contact_phone',
            label: 'Teléfono personal persona de contacto para el proceso*',
            placeHolder: 'Ingresa móvil de persona de contacto',
            type: 'text',
            required: true,
          },
        ],
      },
    ];
  };

  const getDissolutionOfSpaWizardConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para disolución de SPA',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Necesitas terminar una Sociedad por Acciones (SPA)? Si creaste tu empresa en el Registro de Empresas y Sociedades o la migraste al mismo (Empresaen1día), podemos ayudarte a disolverla (si la creaste en el sistema tradicional, en papel, no trabajamos con empresas que pertenezcan a ese registro para este servicio).',
        image: '/images/dashboard/legal_services/dissolution_of_spa_1.png',
        fields: [
          {
            name: 'company_name',
            label: 'Razón Social de la Empresa*',
            placeHolder: 'Ingresa Razón Social de la Empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'company_rut',
            label: 'RUT de la empresa*',
            placeHolder: 'Ingresa RUT de la Empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'shareholder_ids',
            label: 'Socios/accionistas*',
            type: 'shareholders',
            shareholders,
            disabled: true,
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Información para disolución de SPA',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Necesitas terminar una Sociedad por Acciones (SPA)? Si creaste tu empresa en el Registro de Empresas y Sociedades o la migraste al mismo (Empresaen1día), podemos ayudarte a disolverla (si la creaste en el sistema tradicional, en papel, no trabajamos con empresas que pertenezcan a ese registro para este servicio).',
        image: '/images/dashboard/legal_services/dissolution_of_spa_2.png',
        fields: [
          {
            name: 'contact_name',
            label: 'Nombre persona de contacto para el proceso*',
            placeHolder: 'Ingresa nombre de persona de contacto',
            type: 'text',
            required: true,
          },
          {
            name: 'contact_email',
            label: 'Correo persona de contacto para el proceso*',
            placeHolder: 'Ingresa correo electrónico de persona de contacto',
            type: 'email',
            required: true,
          },
          {
            name: 'contact_phone',
            label: 'Teléfono personal persona de contacto para el proceso*',
            placeHolder: 'Ingresa móvil de persona de contacto',
            type: 'text',
            required: true,
          },
        ],
      },
    ];
  };

  const getDissolutionOfEirlWizardConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para disolución de EIRL',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Necesitas terminar una Empresa Individual de Responsabilidad Limitada (EIRL)? Si creaste tu empresa en el Registro de Empresas y Sociedades o la migraste al mismo (Empresaen1día), podemos ayudarte a disolverla (si la creaste en el sistema tradicional, en papel, no trabajamos con empresas que pertenezcan a ese registro para este servicio).',
        image: '/images/dashboard/legal_services/dissolution_of_eirl_1.png',
        fields: [
          {
            name: 'company_name',
            label: 'Razón Social de la Empresa*',
            placeHolder: 'Ingresa Razón Social de la Empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'company_rut',
            label: 'RUT de la empresa*',
            placeHolder: 'Ingresa RUT de la Empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'shareholder_ids',
            label: 'Socios/accionistas*',
            type: 'shareholders',
            shareholders,
            disabled: true,
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Información para disolución de EIRL',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Necesitas terminar una Empresa Individual de Responsabilidad Limitada (EIRL)? Si creaste tu empresa en el Registro de Empresas y Sociedades o la migraste al mismo (Empresaen1día), podemos ayudarte a disolverla (si la creaste en el sistema tradicional, en papel, no trabajamos con empresas que pertenezcan a ese registro para este servicio).',
        image: '/images/dashboard/legal_services/dissolution_of_eirl_2.png',
        fields: [
          {
            name: 'contact_name',
            label: 'Nombre persona de contacto para el proceso*',
            placeHolder: 'Ingresa nombre de persona de contacto',
            type: 'text',
            required: true,
          },
          {
            name: 'contact_email',
            label: 'Correo persona de contacto para el proceso*',
            placeHolder: 'Ingresa correo electrónico de persona de contacto',
            type: 'email',
            required: true,
          },
          {
            name: 'contact_phone',
            label: 'Teléfono personal persona de contacto para el proceso*',
            placeHolder: 'Ingresa móvil de persona de contacto',
            type: 'text',
            required: true,
          },
        ],
      },
    ];
  };

  const getDissolutionOfSrlWizardConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para disolución de SRL',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Necesitas terminar una Sociedad de Responsabilidad Limitada (SRL)? Si creaste tu empresa en el Registro de Empresas y Sociedades o la migraste al mismo (Empresaen1día), podemos ayudarte a disolverla (si la creaste en el sistema tradicional, en papel, no trabajamos con empresas que pertenezcan a ese registro para este servicio).',
        image: '/images/dashboard/legal_services/dissolution_of_srl_1.png',
        fields: [
          {
            name: 'company_name',
            label: 'Razón Social de la Empresa*',
            placeHolder: 'Ingresa Razón Social de la Empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'company_rut',
            label: 'RUT de la empresa*',
            placeHolder: 'Ingresa RUT de la Empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'shareholder_ids',
            label: 'Socios/accionistas*',
            type: 'shareholders',
            shareholders,
            disabled: true,
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Información para disolución de SRL',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Necesitas terminar una Sociedad de Responsabilidad Limitada (SRL)? Si creaste tu empresa en el Registro de Empresas y Sociedades o la migraste al mismo (Empresaen1día), podemos ayudarte a disolverla (si la creaste en el sistema tradicional, en papel, no trabajamos con empresas que pertenezcan a ese registro para este servicio).',
        image: '/images/dashboard/legal_services/dissolution_of_srl_2.png',
        fields: [
          {
            name: 'contact_name',
            label: 'Nombre persona de contacto para el proceso*',
            placeHolder: 'Ingresa nombre de persona de contacto',
            type: 'text',
            required: true,
          },
          {
            name: 'contact_email',
            label: 'Correo persona de contacto para el proceso*',
            placeHolder: 'Ingresa correo electrónico de persona de contacto',
            type: 'email',
            required: true,
          },
          {
            name: 'contact_phone',
            label: 'Teléfono personal persona de contacto para el proceso*',
            placeHolder: 'Ingresa móvil de persona de contacto',
            type: 'text',
            required: true,
          },
        ],
      },
    ];
  };

  const handleWizardClose = () => {
    setState((prevState) => ({
      ...prevState,
      currentWizardConfig: null,
      globalAPI: '',
      successMessage: '',
    }));
    setView(LEGAL_SERVICES_VIEW);
  };

  const handleSuccess = (postId) => {
    currentServiceOrderIdRef.current.serviceOrderId = postId;
    refetch();
    handleWizardClose();
    setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
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
              fetchData().finally(() =>
                appointmentRefetch().finally(() => setView(LEGAL_SERVICES_VIEW))
              );
            }}
          />
        </Switch.Item>
        <Switch.Item case={WIZARD_VIEW}>
          <WizardProvider
            stepsConfig={currentWizardConfig}
            globalSubmitApi={{ method: 'POST', url: globalAPI }}
            successMessage={successMessage}
            errorMessage={errorMessage}
            successButton={successButton}
            onSuccess={handleSuccess}
            onlyCreate={onlyCreate}>
            <WizardForm onClose={handleWizardClose} />
          </WizardProvider>
        </Switch.Item>
        <Switch.Item case={LEGAL_SERVICES_VIEW}>
          <div className="flex flex-col h-full w-full gap-5 px-4 lg:px-10 animate-slide-in mt-10">
            <h1 className="text-2xl text-black font-bold">{`Bienvenido ${companyName}`} </h1>
            <h2 className="text-xl text-black font-bold">Servicios Legales</h2>
            <WizardList wizards={wizards} />
          </div>
        </Switch.Item>
      </Switch>
    </>
  );
}
