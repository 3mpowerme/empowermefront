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

const PayBusinessCreation = forwardRef(({ onComplete = () => {} }, ref) => {
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

  const ensureServiceOrder = async () => {
    const payload = {
      serviceCode: 'business_creation',
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
    setView(SCHEDULE_APPOINTMENT_VIEW);
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
      message: 'Se agendó tu cita con exito',
      button: {},
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

  useEffect(() => {
    //setView(SUCCESSFULL_SUBSCRIPTION_VIEW);
    setView(PAY_APPOINTMENT_VIEW);
  }, []);

  const { plan: plans } = useServicePlan('business_creation');
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
            <h1 className="text-xl font-bold text-center">Creación de Empresa</h1>
            <p>
              La redacción de los estatutos la realiza el asesor, quien te irá explicando cada etapa
              del proceso y en la misma sesión se firma electrónicamente y queda lista la empresa.
              Si no tienes aún la dirección tributaria acreditable para el SII igualmente puedes
              crear la empresa y es necesario que lo hagas ya que deberás acreditar esa dirección a
              nombre de la empresa y obviamente eso no puede ocurrir si no creas la empresa antes.
              Necesitas tener tu carnet y clave única del registro civil. Igualmente durante la
              sesión se te orientará de manera general en otros aspectos como el inicio de
              actividades y la habilitación para facturar/boletear electrónicamente. Importantes:
              1.- El precio de la asesoría considera creaciones de empresa con hasta 3 socios o
              accionistas, en el caso de ser más, se cobrará un adicional de $20.000 por cada extra
              (si por ejemplo son 4 socios/accionistas, 3 estarían incluidos en el precio publicado
              y se cobraría 1 adicional). Este monto adicional se te cobrará al finalizar la
              asesoría.
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
            serviceCode={'business_creation'}
            folio={paymentIntentId}
            goTo={'taxes_and_accounting/business_creation'}
          />
        </Switch.Item>
      </Switch>
    </>
  );
});

export default PayBusinessCreation;
