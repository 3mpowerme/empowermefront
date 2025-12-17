import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import Modal, { ModalBody, ModalFooter } from '../Modal/Modal';
import PlanSelector from '../PlanSelector/PlanSelector';
import CardSelector from '../CardSelector/CardSelector';
import Button from '../Button/Button';
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
import NumberInput from '../NumberInput/NumberInput';
import SuccessfullPayment from './SuccessfullPayment/SuccessfullPayment';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_APPOINTMENT_VIEW = 'pay-appointment-view';
const PAY_WITH_STRIPE_VIEW = 'pay-with-stripe-view';
const SCHEDULE_APPOINTMENT_VIEW = 'schedule-appointment-view';
const SUCCESSFULL_SUBSCRIPTION_VIEW = 'successfull-subscription-view';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PayVirtualOffice = forwardRef(({ onComplete = () => {} }, ref) => {
  const [openMethodModal, setOpenMethodModal] = useState(false);
  const [openStripeModal, setOpenStripeModal] = useState(false);
  const [view, setView] = useState(LOADING_VIEW);
  const [selectedMethod, setSelectedMethod] = useState([]); // [id]
  const [clientSecret, setClientSecret] = useState('');
  const [count, setCount] = useState(1);
  const [paymentIntentId, setPaymentIntentId] = useState('');

  const { account, activeCompany: companyId } = useAccount();
  const { email = '', name = '' } = account || {};
  const { setToast } = useApp();
  const navigate = useNavigate();

  const ensureServiceOrder = async () => {
    const payload = {
      serviceCode: 'virtual_office',
      companyId,
      count,
    };

    const res = await privateService.create('/payments/service-order', payload);

    if (res?.serviceOrderId) {
      ref.current = { ...(ref.current || {}), serviceOrderId: res.serviceOrderId };
      return res.serviceOrderId;
    }
    throw new Error('No se pudo crear la orden de servicio');
  };

  const startStripePayment = async () => {
    try {
      const serviceOrderId = await ensureServiceOrder();
      console.log('serviceOrderId', serviceOrderId);
      const { clientSecret } = await privateService.create('/payments/create-intent', {
        serviceOrderId,
      });
      console.log('clientSecret', clientSecret);
      setClientSecret(clientSecret);
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

  const onStripeSuccess = (paymentIntent) => {
    setToast({
      show: true,
      message: 'Se realizó tu pago con exito',
      button: {},
      type: 'success',
    });
    setOpenStripeModal(false);
    setOpenMethodModal(false);
    setPaymentIntentId(paymentIntent.id);
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

  useEffect(() => {
    //setView(SUCCESSFULL_SUBSCRIPTION_VIEW);
    setView(PAY_APPOINTMENT_VIEW);
  }, []);

  const { plan: plans } = useServicePlan('virtual_office');
  console.log('HERE plan', plans);
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
            <h1 className="text-xl font-bold text-center">Oficina Virtual</h1>
            <p>
              Si tu empresa vende productos físicos o requiere espacio de bodegaje para
              almacenamiento de herramientas (o el SII dice que es lo que requiere para acreditar),
              no te sirve este servicio, puedes revisar el que tenemos de Oficina Virtual +
              Minibodega que sirve para todo eso.
            </p>
            <p>
              ¿Para qué actividades puede acreditarse domicilio con oficina virtual?: Servicios
              profesionales Servicios que se presten de forma telemática Servicios que se presten en
              terreno En todos estos casos el SII aprobará y visitará el domicilio para confirmar
              que la empresa funcione en el lugar indicado. Nuestras oficinas cuentan con
              profesionales encargados de que en esa visita la documentación esté al día. La
              dirección exacta del domicilio tributario que usted contratará en la comuna que elija
              (de las 3 que tenemos disponibles) se entregará en su respectivo contrato una vez que
              haya contratado el servicio. También es requisito obligatorio para todas las empresas
              en Chile obtener patente municipal y con este servicio puedes tramitar sin ningún
              problema este requisito.
            </p>
            <p>
              El servicio de arriendo de oficina virtual es solo eso, un arriendo, en ningún caso
              implica algún tipo de asesoría en la acreditación del domicilio o tramitación de
              patente municipal por parte de Alpha Consulting SpA (disponemos de este tipo de
              asistencia para acreditación ante el SII para clientes que además contratan
              contabilidad en modalidad semestral o anual con nosotros), si solo contratas el
              arriendo de oficina virtual, te proporcionaremos toda la documentación necesaria para
              las acreditaciones, que serán de tu entera responsabilidad tramitar por cuenta propia,
              no recayendo ninguna responsabilidad en Alpha Consulting SpA respecto de posibles
              rechazos tanto de domicilio tributario o solicitud de patente municipal por una
              gestión deficiente o incompleta de las mismas o simplemente porque se requiera apelar
              ante cualquiera de estas instituciones sobre su decisión de rechazo, en cuyo caso no
              aplicará ningún tipo de reembolso del servicio, puesto que este, como antes se indicó
              es un arriendo disponible para ser gestionado por su titular acorde a las condiciones
              del contrato de arriendo. Cualquier reembolso solo aplicará bajo el cumplimiento de 2
              condiciones estipuladas en la Ley del Consumidor chilena y estas son (deben cumplirse
              ambas, no solo 1 de las 2): 1.- No pueden haber transcurrido más de 10 días corridos
              contados desde la compra del servicio. 2.- El servicio no puede haber sido utilizado
              (si ya se procesó tu contrato de arriendo eso cuenta como uso del servicio).
            </p>
            <div className="w-1/5">
              <NumberInput value={count} onChange={setCount} min={1} max={100} step={1} />
            </div>

            <PlanSelector
              plans={plans.map((it) => ({
                ...it,
                onClick: () => {
                  setOpenMethodModal(true);
                },
              }))}
              showInclude={false}
            />

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
            <StripePaymentModal
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
          <SuccessfullPayment
            companyId={companyId}
            serviceCode={'virtual_office'}
            folio={paymentIntentId}
            goTo={'taxes_and_accounting/virtual_office'}
          />
        </Switch.Item>
      </Switch>
    </>
  );
});

export default PayVirtualOffice;
