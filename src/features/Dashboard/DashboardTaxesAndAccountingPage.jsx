import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { privateService } from '../../services/privateService';
import WizardList from '../../components/WizardList/WizardList';
import { WizardProvider } from '../../context/WizardContext/WizardProvider';
import WizardForm from '../../components/WizardForm/WizardForm';
import { genericService } from '../../services/genericService';
import { mapCatalogToOptions } from '../../utils/catalogs';
import { useAccount } from '../../hooks/useAccount';
import { useApp } from '../../hooks/useApp';
import { storage } from '../../utils/storage';
import Switch from '../../components/Switch/Switch';
import { useDashboard } from '../../hooks/useDashboard';
import PayAndScheduleAppointment from '../../components/PayAndScheduleAppointment/PayAndScheduleAppointment';
import { useAppointment } from '../../hooks/useAppointment';
import { normalizeAppointmentStatus } from '../../utils/utils';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_AND_SCHEDULE_APPOINTMENT_VIEW = 'pay-appointment-view';
const TAXES_AND_ACCOUNTING_VIEW = 'taxes-and-accounting-view';
const WIZARD_VIEW = 'wizard-view';

export default function DashboardTaxesAndAccountingPage() {
  const { setIsLoading, setToast } = useApp();
  const { activeCompanyInfo: { companyName } = {}, activeCompany: companyId } = useAccount();
  const navigate = useNavigate();
  const commercialMovementRef = useRef([]);
  const companyTaxInfoRef = useRef({});
  const companyLegalRepresentativeRef = useRef({});
  const [state, setState] = useState({
    currentWizardConfig: null,
    globalAPI: '',
    successMessage: '',
    errorMessage: 'La solicitud no pudo ser procesada',
    successButton: {},
  });
  const { currentWizardConfig, globalAPI, successMessage, errorMessage, successButton } = state;
  const [view, setView] = useState(LOADING_VIEW);

  const currentServiceOrderIdRef = useRef({ serviceOrderId: null, serviceType: null });
  const setServiceType = (st) => {
    currentServiceOrderIdRef.current.serviceType = st;
  };

  const { appointment, refetch: appointmentRefetch } = useAppointment();

  const { wizards: ws } = useDashboard();

  const mapWizards = (ws) => {
    return ws.map((w) => {
      w.buttonType = undefined;
      const appointmentFiltered = appointment?.find((it) => {
        return w?.link?.includes(it?.service_code);
      });
      if (appointmentFiltered?.appointment_status === null) {
        w.buttonType = 'to-schedule';
        setServiceType('accounting');
        currentServiceOrderIdRef.current.serviceOrderId = appointmentFiltered?.service_order_id;
        w.buttonCb = () => {
          setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        };
      }
      if (appointmentFiltered?.appointment_status) {
        w.buttonType = 'scheduled';
        setServiceType('accounting');
        w.buttonLabel = normalizeAppointmentStatus(appointmentFiltered?.appointment_status);
        w.buttonCb = () => {
          setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        };
      }
      w.onClick = (link) => {
        const hasCompanyInfo = Object.keys(companyTaxInfoRef.current).length > 0;
        const hasLegalRepresentative =
          Object.keys(companyLegalRepresentativeRef.current).length > 0;
        let sub;
        if (!hasLegalRepresentative) {
          sub = 'legal-representative';
        }
        if (!hasCompanyInfo) {
          sub = 'tax-info';
        }

        if (!hasCompanyInfo || !hasLegalRepresentative) {
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
            message:
              'Debes tener completo tu perfil tributario y tener un representante legal para continuar',
            type: 'success',
            button,
          });
          return;
        }
        console.log('link', link);
        if (link === 'monthly_accounting_wizard') {
          const currentInfo =
            storage.getItem(`wizard_form/company-monthly-accounting-request/${companyId}`) ?? {};
          storage.setItem(`wizard_form/company-monthly-accounting-request/${companyId}`, {
            ...currentInfo,
            legal_representative_name: companyLegalRepresentativeRef.current?.name,
            legal_representative_phone: companyLegalRepresentativeRef.current?.phone,
            legal_representative_rut: companyLegalRepresentativeRef.current?.rut,
            company_contact_phone: companyTaxInfoRef.current?.phone,
            email: companyTaxInfoRef.current?.email,
            rut: companyTaxInfoRef.current?.rut,
            mutual_password: companyTaxInfoRef.current?.mutual_password,
            previred_password: companyTaxInfoRef.current?.previred_password,
          });
          setState((prevState) => ({
            ...prevState,
            currentWizardConfig: getTaxesAndAccountingWizardConfig(),
            globalAPI: `/company-monthly-accounting-request/${companyId}`,
            successMessage:
              'La solicitud para servicios de contabilidad de la Empresa se envio correctamente',
          }));
          setServiceType('accounting');
          setView(WIZARD_VIEW);
        }

        if (link === 'tax_audit_wizard') {
          const currentInfo =
            storage.getItem(`wizard_form/company-audit-request/${companyId}`) ?? {};
          storage.setItem(`wizard_form/company-audit-request/${companyId}`, {
            ...currentInfo,
            company_name: companyTaxInfoRef.current?.business_name,
            company_rut: companyTaxInfoRef.current?.rut,
            company_tax_address: companyTaxInfoRef.current?.address,
            company_tax_key: companyTaxInfoRef.current?.password,
            legal_representative_name: companyLegalRepresentativeRef.current?.name,
            legal_representative_rut: companyLegalRepresentativeRef.current?.rut,
            legal_representative_tax_key: companyLegalRepresentativeRef.current?.password,
          });
          setState((prevState) => ({
            ...prevState,
            currentWizardConfig: getCompanyAuditInfoWizardConfig(),
            globalAPI: `/company-audit-request/${companyId}`,
            successMessage:
              'La solicitud para servicios de auditoria de la Empresa se envio correctamente',
          }));
          setServiceType('audit');
          setView(WIZARD_VIEW);
        }
        if (link === 'balance_wizard') {
          const currentInfo =
            storage.getItem(`wizard_form/company-balance-request/${companyId}`) ?? {};
          storage.setItem(`wizard_form/company-balance-request/${companyId}`, {
            ...currentInfo,
            company_name: companyTaxInfoRef.current?.business_name,
            company_rut: companyTaxInfoRef.current?.rut,
            company_tax_address: companyTaxInfoRef.current?.address,
            company_tax_key: companyTaxInfoRef.current?.password,
            legal_representative_name: companyLegalRepresentativeRef.current?.name,
            legal_representative_rut: companyLegalRepresentativeRef.current?.rut,
            legal_representative_tax_key: companyLegalRepresentativeRef.current?.password,
          });
          setState((prevState) => ({
            ...prevState,
            currentWizardConfig: getCompanyBalanceInfoWizardConfig(),
            globalAPI: `/company-balance-request/${companyId}`,
            successMessage:
              'La solicitud para la elaboración del balance de la Empresa se envio correctamente',
          }));
          setServiceType('balance');
          setView(WIZARD_VIEW);
        }
        if (link === 'remunerations_wizard') {
          setServiceType('remunerations');
          setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        }
        if (link === 'tax_planning_wizard') {
          setServiceType('tax_planning');
          setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
        }
      };
      console.log('w', w);
      return w;
    });
  };

  const wizards = useMemo(() => {
    if (!Array.isArray(ws)) return [];
    return mapWizards(ws);
  }, [ws, appointment]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const commercialMovementsResult = await genericService.getAll('/commercial-movements');
      commercialMovementRef.current = commercialMovementsResult;
      const companyTaxInfoResponse = await privateService.get(`/company-tax-info/${companyId}`);
      const companyLegalRepresentativeResponse = await privateService.get(
        `/company-legal-representative/${companyId}`
      );
      companyTaxInfoRef.current = companyTaxInfoResponse;
      companyLegalRepresentativeRef.current = companyLegalRepresentativeResponse;
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

  const getTaxesAndAccountingWizardConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Pasos para ingresar como cliente para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description:
          'La contabilidad y el cumplimiento tributario son las áreas más sensibles de cualquier empresa, ya que un manejo inadecuado de las mismas puede derivar en multas y malos ratos innecesarios, cuando podrías haber llevado todo en orden y en regla con nosotros.',
        image: '/images/dashboard/taxes_and_accounting/monthly_accounting_1.jpg',
        fields: [
          {
            name: 'email',
            label: 'Ingresa correo electrónico*',
            placeHolder: 'Ingresa correo electrónico',
            type: 'email',
            required: true,
            disabled: true,
          },
          {
            name: 'company_contact_phone',
            label: 'Teléfono de contacto de la empresa*',
            placeHolder: 'Ingresa teléfono de contacto de la empresa',
            type: 'text',
            required: true,
          },
          {
            name: 'legal_representative_name',
            label: 'Nombre de representante legal de la empresa*',
            placeHolder: 'Ingresa nombre de representante legal de la empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'legal_representative_rut',
            label: 'RUT representante legal de la empresa*',
            placeHolder: 'Ingresa RUT de representante(s) legal(es)',
            type: 'text',
            required: true,
            disabled: true,
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Pasos para ingresar como cliente para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description:
          'La contabilidad y el cumplimiento tributario son las áreas más sensibles de cualquier empresa, ya que un manejo inadecuado de las mismas puede derivar en multas y malos ratos innecesarios, cuando podrías haber llevado todo en orden y en regla con nosotros.',
        image: '/images/dashboard/taxes_and_accounting/monthly_accounting_2.jpg',
        fields: [
          {
            name: 'legal_representative_phone',
            label: 'Teléfono del representante legal*',
            placeHolder: 'Ingresa teléfono del representante legal',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'need_startup_support',
            label: 'Necesitas apoyo con el inicio de actividades*',
            placeHolder: 'Ingresa teléfono de contacto de la empresa',
            type: 'radio',
            options: [
              {
                value: 'SI',
                label: 'Si',
              },
              {
                value: 'NO',
                label: 'No',
              },
            ],
            required: true,
          },
          {
            name: 'commercial_movements',
            label:
              '¿Que tipo de movimientos comerciales tiene su empresa? marque todas las alternativas que correspondan*',
            type: 'radio',
            options: mapCatalogToOptions(commercialMovementRef.current),
            required: true,
            multiple: true,
          },
        ],
      },
      {
        id: 'step-3',
        title: 'Pasos para ingresar como cliente para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description:
          'La contabilidad y el cumplimiento tributario son las áreas más sensibles de cualquier empresa, ya que un manejo inadecuado de las mismas puede derivar en multas y malos ratos innecesarios, cuando podrías haber llevado todo en orden y en regla con nosotros.',
        image: '/images/dashboard/taxes_and_accounting/monthly_accounting_3.jpg',
        fields: [
          {
            name: 'rut',
            label: 'Rut',
            placeHolder: 'Ingresa RUT (sólo en caso de tener una cuenta activa)',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'previred_password',
            label: 'clave previred',
            placeHolder: 'Ingresa clave previred (sólo en caso de tener una cuenta activa)',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'mutual_password',
            label: 'clave mutual*',
            placeHolder: 'Ingresa clave mutual (sólo en caso de tener una cuenta activa)',
            type: 'text',
            required: true,
            disabled: true,
          },
        ],
      },
    ];
  };

  const getCompanyAuditInfoWizardConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para proceso de auditoria',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Necesitas revisar la situación tributaria de tu empresa? En Alpha Consulting podemos ayudarte, realizaremos una completa revisión de toda tu situación tributaria y te entregaremos un diagnóstico y si es necesario, un nuevo presupuesto y acciones concretas para lo que haya que subsanar (si es que corresponde subsanar algo).',
        image: '/images/dashboard/taxes_and_accounting/tax_audit_1.jpg',
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
            name: 'company_tax_address',
            label: 'Dirección Tributaria de la Empresa',
            placeHolder: 'Ingresa dirección Tributaria de la empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'company_tax_key',
            label: 'Clave Tributaria de la Empresa (para acceder a www.sii.cl) *',
            placeHolder: 'Ingresa Clave Tributaria de la Empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Pasos para ingresar como cliente para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Necesitas revisar la situación tributaria de tu empresa? En Alpha Consulting podemos ayudarte, realizaremos una completa revisión de toda tu situación tributaria y te entregaremos un diagnóstico y si es necesario, un nuevo presupuesto y acciones concretas para lo que haya que subsanar (si es que corresponde subsanar algo).',
        image: '/images/dashboard/taxes_and_accounting/tax_audit_2.jpg',
        fields: [
          {
            name: 'legal_representative_name',
            label: 'Nombre de representante legal de la empresa*',
            placeHolder: 'Ingresa nombre de representante legal de la empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'legal_representative_rut',
            label: 'RUT representante legal de la empresa*',
            placeHolder: 'Ingresa RUT de representante(s) legal(es)',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'legal_representative_tax_key',
            label:
              'Clave Tributaria personal del Representante Legal (para acceder a www.sii.cl) *',
            placeHolder: 'Ingresa Clave Tributaria personal del representante legal de la empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'contact_name',
            label: 'Nombre persona de contacto para el proceso*',
            placeHolder: 'Ingresa nombre de persona de contacto',
            type: 'text',
            required: true,
          },
        ],
      },
      {
        id: 'step-3',
        title: 'Pasos para ingresar como cliente para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Necesitas revisar la situación tributaria de tu empresa? En Alpha Consulting podemos ayudarte, realizaremos una completa revisión de toda tu situación tributaria y te entregaremos un diagnóstico y si es necesario, un nuevo presupuesto y acciones concretas para lo que haya que subsanar (si es que corresponde subsanar algo).',
        image: '/images/dashboard/taxes_and_accounting/tax_audit_3.jpg',
        fields: [
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

  const getCompanyBalanceInfoWizardConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para elaboración de balance',
        subtitle: '(Pre Balance) Complete toda la información solicitada',
        description:
          '¿Necesitas saber cómo va tu empresa en ventas?, ¿calcular cuánto en impuestos deberás pagar en la próxima declaración de renta anual? Es muy importante tener este tipo de información para tomar decisión y prepararte de mejor manera para el cumplimiento de tus obligaciones impositivas y su correcta tributación.',
        image: '/images/dashboard/taxes_and_accounting/balance_1.jpg',
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
            name: 'company_tax_address',
            label: 'Dirección Tributaria de la Empresa',
            placeHolder: 'Ingresa dirección Tributaria de la empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'company_tax_key',
            label: 'Clave Tributaria de la Empresa (para acceder a www.sii.cl) *',
            placeHolder: 'Ingresa Clave Tributaria de la Empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Pasos para ingresar como cliente para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Necesitas revisar la situación tributaria de tu empresa? En Alpha Consulting podemos ayudarte, realizaremos una completa revisión de toda tu situación tributaria y te entregaremos un diagnóstico y si es necesario, un nuevo presupuesto y acciones concretas para lo que haya que subsanar (si es que corresponde subsanar algo).',
        image: '/images/dashboard/taxes_and_accounting/balance_2.jpg',
        fields: [
          {
            name: 'legal_representative_name',
            label: 'Nombre de representante legal de la empresa*',
            placeHolder: 'Ingresa nombre de representante legal de la empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'legal_representative_rut',
            label: 'RUT representante legal de la empresa*',
            placeHolder: 'Ingresa RUT de representante(s) legal(es)',
            type: 'text',
            required: true,
            disabled: true,
          },
          {
            name: 'legal_representative_tax_key',
            label:
              'Clave Tributaria personal del Representante Legal (para acceder a www.sii.cl) *',
            placeHolder: 'Ingresa Clave Tributaria personal del representante legal de la empresa',
            type: 'text',
            required: true,
            disabled: true,
          },
        ],
      },
      {
        id: 'step-3',
        title: 'Pasos para ingresar como cliente para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Necesitas revisar la situación tributaria de tu empresa? En Alpha Consulting podemos ayudarte, realizaremos una completa revisión de toda tu situación tributaria y te entregaremos un diagnóstico y si es necesario, un nuevo presupuesto y acciones concretas para lo que haya que subsanar (si es que corresponde subsanar algo).',
        image: '/images/dashboard/taxes_and_accounting/balance_3.jpg',
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

  const handleWizardSuccess = (postId) => {
    currentServiceOrderIdRef.current.serviceOrderId = postId;
    fetchData();
    handleWizardClose();
    setTimeout(() => {
      setView(PAY_AND_SCHEDULE_APPOINTMENT_VIEW);
    }, 200);
  };

  const handleWizardClose = () => {
    setState((prevState) => ({
      ...prevState,
      currentWizardConfig: null,
      globalAPI: '',
      successMessage: '',
    }));
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
              fetchData().finally(() =>
                appointmentRefetch().finally(() => setView(TAXES_AND_ACCOUNTING_VIEW))
              );
            }}
          />
        </Switch.Item>
        <Switch.Item case={WIZARD_VIEW}>
          <WizardProvider
            onlyCreate
            stepsConfig={currentWizardConfig}
            globalSubmitApi={{ method: 'POST', url: globalAPI }}
            successMessage={successMessage}
            successButton={successButton}
            errorMessage={errorMessage}
            onSuccess={handleWizardSuccess}>
            <WizardForm onClose={handleWizardClose} />
          </WizardProvider>
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
