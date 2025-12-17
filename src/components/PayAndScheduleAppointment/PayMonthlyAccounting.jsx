import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import Modal, { ModalBody, ModalFooter } from '../../components/Modal/Modal';
import PlanSelector from '../../components/PlanSelector/PlanSelector';
import CardSelector from '../../components/CardSelector/CardSelector';
import Button from '../../components/Button/Button';
import { privateService } from '../../services/privateService';
import { useApp } from '../../hooks/useApp';
import { useAccount } from '../../hooks/useAccount';
import Switch from '../Switch/Switch';
import StripePaymentModal from '../stripe/StripePaymentModal';
import { Elements } from '@stripe/react-stripe-js';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router';
import CalendlyPopup from '../CalendlyPopup/CalendlyPopup';
import { loadStripe } from '@stripe/stripe-js';
import { useServicePlan } from '../../hooks/useServicePlan';
import Select from '../Select/Select';
import StripeSubscribeModal from '../stripe/StripeSubscribeModal';
import SuccessfulSubscriptionMonthlyAccounting from './SuccessfullSubscription';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_APPOINTMENT_VIEW = 'pay-appointment-view';
const PAY_WITH_STRIPE_VIEW = 'pay-with-stripe-view';
const SCHEDULE_APPOINTMENT_VIEW = 'schedule-appointment-view';
const SUCCESSFULL_SUBSCRIPTION_VIEW = 'successfull-subscription-view';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PayMonthlyAccounting = forwardRef(({ onComplete = () => {} }, ref) => {
  const [openMethodModal, setOpenMethodModal] = useState(false);
  const [openStripeModal, setOpenStripeModal] = useState(false);
  const [view, setView] = useState(LOADING_VIEW);
  const [selectedPlan, setSelectedPlan] = useState({});
  const [selectedMethod, setSelectedMethod] = useState([]); // [id]
  const [clientSecret, setClientSecret] = useState('');
  const [planName, setPlanName] = useState('');
  const [priceSummary, setPriceSummary] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');

  const { account, activeCompany: companyId } = useAccount();
  const { email = '', name = '' } = account || {};
  const { plan } = useServicePlan('accounting');
  console.log('plan', plan);
  const { setToast } = useApp();
  const navigate = useNavigate();

  const startStripePayment = async () => {
    try {
      const { clientSecret, planName, priceSummary, subscriptionId } = await privateService.create(
        '/subscription',
        {
          companyId,
          planId: selectedPlan.id,
        }
      );
      console.log('clientSecret', clientSecret);
      console.log('planName', planName);
      console.log('priceSummary', priceSummary);
      console.log('subscriptionId', subscriptionId);
      setClientSecret(clientSecret);
      setPlanName(planName);
      setPriceSummary(priceSummary);
      setSubscriptionId(subscriptionId);
      setView(PAY_WITH_STRIPE_VIEW);
      setOpenStripeModal(true);
    } catch (e) {
      setToast({
        show: true,
        message: e.error,
        type: 'error',
        button: {},
      });
      console.error(e);
    }
  };

  const onStripeSuccess = () => {
    setToast({
      show: true,
      message: 'Se realizó tu pago con exito',
      button: {},
      type: 'success',
    });
    setOpenStripeModal(false);
    setOpenMethodModal(false);

    setView(SUCCESSFULL_SUBSCRIPTION_VIEW);
  };

  const handleMethodProceed = async () => {
    const id = selectedMethod?.[0];
    if (id === 3) {
      // Stripe
      await startStripePayment();
    } else if (id === 1) {
      alert('PayPal próximamente');
    } else if (id === 2) {
      alert('Webpay próximamente');
    }
  };

  const handleScheduleAppointment = async () => {
    setToast({
      show: true,
      message: 'Se agendó tu cita con exito, puedes revisarla en la sección mis citas',
      button: {
        message: 'ir a Mis citas',
        onClick: () => {
          goToAppointments();
        },
      },
      type: 'success',
    });
    onComplete();
  };

  const options = useMemo(
    () => ({
      clientSecret,
      appearance: { theme: 'stripe' },
    }),
    [clientSecret]
  );

  const goToAppointments = () => {
    navigate('/dashboard/appointments');
  };

  const planOptions = [
    { value: 'month-1', label: 'Mensual' },
    { value: 'month-6', label: 'Semestral (¡Ahora un 10%!)' },
    { value: 'year', label: 'Anual (¡Ahora un 20%!)' },
  ];

  const [optionSelected, setOptionSelected] = useState('month-1');
  const handleChange = (option) => {
    setOptionSelected(option);
  };

  const filteredPlans = useMemo(() => {
    const isMonth = optionSelected?.includes('month');
    let count;
    if (isMonth) {
      count = optionSelected.split('-')[1];
    }

    return isMonth
      ? plan
          .filter((p) => p.how_often === 'month' && p.interval_count == count)
          .map((it) => ({
            ...it,
            onClick: () => {
              setSelectedPlan(it);
              setOpenMethodModal(true);
            },
            discountLabel: it.interval_count === 6 ? '¡Ahorra un 10%!' : '',
            include: [
              'Servicio de consultas permanente en materia contable vía WhatsApp exclusivamente',
              'Creación y envío de Formulario 29 (F29) mensual',
              'Envío de informes de compra venta mensual',
              'Ingreso de importaciones como compras en la contabilidad (con declaración de ingreso de Aduana)',
              'Ingreso de compras a proveedores de servicios internacionales que no tributan en Chile en la contabilidad (con factura de compra, compras de publicidad en meta, Google Ads y similares)',
              'Asistencia en presentación de todo tipo de peticiones administrativas al SII (redacción y presentación de solicitudes al SII)',
              'Asistencia en modificación de actividades económicas y su respectiva acreditación',
              'Asistencia en modificación de domicilios tributarios y su respectiva acreditación',
              'Asistencia en habilitación de facturas de exportación',
              'Asistencia en ingreso de vehículos a la contabilidad de la empresa',
              'Orientación en emisión, modificación y anulación de todo tipo de documentos tributarios (boletas de venta, facturas de venta, facturas de compra, guías de despacho, notas de crédito y notas de débito)',
              'Orientación en uso y entendimiento de la plataforma del SII',
              'Participación en charlas, seminarios, capacitaciones y eventos gratuitos exclusivos para clientes de contabilidad de Alpha Consulting',
              'Descuentos especiales para clientes de contabilidad de Alpha Consulting en charlas, seminarios, capacitaciones y eventos pagados',
            ],
          }))
      : plan
          .filter((p) => p.how_often === 'year')
          .map((it) => ({
            ...it,
            onClick: () => {
              setSelectedPlan(it);
              setOpenMethodModal(true);
            },
            discountLabel: '¡Ahorra un 20%!',
          }));
  }, [optionSelected, plan]);

  useEffect(() => {
    //setView(SUCCESSFULL_SUBSCRIPTION_VIEW);
    setView(PAY_APPOINTMENT_VIEW);
  }, [filteredPlans.length]);

  return (
    <>
      {onComplete && (
        <div className="absolute w-10 top-20 right-5">
          <button className="p-0 border-0 cursor-pointer" onClick={onComplete}>
            <X />
          </button>
        </div>
      )}
      <Switch value={view}>
        <Switch.Item case={LOADING_VIEW} />
        <Switch.Item case={ERROR_VIEW} />

        <Switch.Item case={PAY_APPOINTMENT_VIEW}>
          <div className="flex flex-col items-center space-y-5 px-6 md:px-10 lg:px-20 mt-10 md:mt-20">
            <h1 className="text-xl font-bold text-center">
              Elija el plan perfecto para poner en marcha tu Empresa
            </h1>
            <p className="text-md font-semibold text-center">
              Con contabilidad semestral o anual, te incluimos sin costo todos los trámites para
              dejar tu empresa lista para facturar (inicio de actividades, RUT/clave tributaria,
              boletas y facturación electrónica y certificado digital). (Obtén un descuento en
              planes semestrales y anuales)
            </p>

            <p>
              * Si contratas contabilidad en modalidad semestral o anual (no mensual) y requieres
              inicio de actividades y asistencia en procesos para que tu empresa quede facturando,
              incluimos todo esto gratuitamente. Esto es: Inicio de actividades Acreditación de
              domicilio Acreditación de actividades económicas Obtención de ERUT Inscripción en el
              sistema de emisión de boletas de venta electrónica Inscripción en el sistema de
              emisión de facturación electrónica Obtención de clave tributaria de la empresa
              Instalación y centralización del certificado digital para firma de documentos
              tributarios que lo requieren
            </p>
            <div className="w-1/2">
              <Select options={planOptions} onChange={handleChange} value={optionSelected} />
            </div>
            <p>
              Todos los planes incluyen habilitación tributaria completa para dejar tu empresa lista
              para facturar.
            </p>

            <PlanSelector plans={filteredPlans} showInclude={false} />

            <Modal
              open={openMethodModal}
              onClose={() => setOpenMethodModal(false)}
              title="Procesar pago"
              subtitle="Selecciona tu método de pago.">
              <ModalBody>
                <CardSelector
                  columns={1}
                  onCardChange={(ids) => setSelectedMethod(ids)}
                  cards={[
                    {
                      id: 3,
                      image: '/images/dashboard/payment/card.png',
                      name: 'Tarjeta',
                    },
                  ]}
                />
              </ModalBody>
              <ModalFooter>
                <Button onClick={handleMethodProceed} disabled={!selectedMethod?.length}>
                  Continuar
                </Button>
              </ModalFooter>
            </Modal>
          </div>
        </Switch.Item>

        <Switch.Item case={PAY_WITH_STRIPE_VIEW}>
          {/* Modal Stripe */}
          <Elements stripe={stripePromise} options={options}>
            <StripeSubscribeModal
              subscriptionId={subscriptionId}
              planName={planName}
              priceSummary={priceSummary}
              open={openStripeModal}
              onClose={() => {
                setOpenStripeModal(false);
                setView(PAY_APPOINTMENT_VIEW);
              }}
              clientSecret={clientSecret}
              onSuccess={onStripeSuccess}
            />
          </Elements>
        </Switch.Item>

        <Switch.Item case={SCHEDULE_APPOINTMENT_VIEW}>
          <CalendlyPopup
            onEventScheduled={handleScheduleAppointment}
            user={{ email, name }}
            ref={ref}
            // TODO remove hardcode 30min
            url={`https://calendly.com/mariano-empowerme/${'30min'}?locale=es`}
          />
        </Switch.Item>
        <Switch.Item case={SUCCESSFULL_SUBSCRIPTION_VIEW}>
          <SuccessfulSubscriptionMonthlyAccounting
            folio={subscriptionId}
            companyId={companyId}
            serviceId={ref.current.serviceType}
            showRequiredDocuments
            onSchedule={() => {
              setView(SCHEDULE_APPOINTMENT_VIEW);
            }}
          />
        </Switch.Item>
      </Switch>
    </>
  );
});

export default PayMonthlyAccounting;
