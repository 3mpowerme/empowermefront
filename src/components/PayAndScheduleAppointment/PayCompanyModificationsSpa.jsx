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
import { Info, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import CalendlyPopup from '../CalendlyPopup/CalendlyPopup';
import { loadStripe } from '@stripe/stripe-js';
import { useServicePlan } from '../../hooks/useServicePlan';
import Select from '../Select/Select';
import StripeSubscribeModal from '../stripe/StripeSubscribeModal';
import SuccessfulSubscriptionMonthlyAccounting from './SuccessfullSubscription';
import NumberInput from '../NumberInput/NumberInput';
import SuccessfullPayment from './SuccessfullPayment/SuccessfullPayment';
import Tooltip from '../Tooltip/Tooltip';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_APPOINTMENT_VIEW = 'pay-appointment-view';
const PAY_WITH_STRIPE_VIEW = 'pay-with-stripe-view';
const SCHEDULE_APPOINTMENT_VIEW = 'schedule-appointment-view';
const SUCCESSFULL_SUBSCRIPTION_VIEW = 'successfull-subscription-view';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PayCompanyModificationsSpa = forwardRef(({ onComplete = () => {} }, ref) => {
  const [openMethodModal, setOpenMethodModal] = useState(false);
  const [openStripeModal, setOpenStripeModal] = useState(false);
  const [view, setView] = useState(LOADING_VIEW);
  const [selectedMethod, setSelectedMethod] = useState([]); // [id]
  const [clientSecret, setClientSecret] = useState('');
  const [count, setCount] = useState(0);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [includeShareholdersRegistry, setIncludeShareholdersRegistry] = useState(false);
  const { account, activeCompany: companyId } = useAccount();
  const { email = '', name = '' } = account || {};
  const { setToast } = useApp();
  const navigate = useNavigate();

  const ensureServiceOrder = async () => {
    const payload = {
      serviceCode: 'company_modifications_spa',
      companyId,
      count: 1,
    };

    if (includeShareholdersRegistry) {
      payload.items = [
        {
          serviceCode: 'shareholders_registry',
          quantity: 1,
        },
      ];
    }

    if (count > 0) {
      if (Array.isArray(payload.items)) {
        payload.items.push({
          serviceCode: 'share_purchase_and_sale',
          quantity: count,
        });
      } else {
        payload.items = [
          {
            serviceCode: 'share_purchase_and_sale',
            quantity: count,
          },
        ];
      }
    }

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

  const { plan: plans } = useServicePlan('company_modifications_spa');
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
            <h1 className="text-xl font-bold text-center">
              Modificación de Sociedad por Acciones SpA
            </h1>
            <p>
              Si la modificación de Sociedad por Acciones SpA requiere cambiar la participación de
              los accionistas (cantidad de acciones, disminuir o aumentar o venta para la salida o
              entrada de un nuevo accionista de la sociedad) se agrega un valor de $35.000 por cada
              compraventa de acciones que se deba redactar y esta igualmente se protocoliza ante
              notario (se incorpora al proceso en los pasos 2, 3 y 4).
            </p>
            <p>
              El primer plazo del servicio de Modificación de Sociedad por Acciones SpA de 7 días
              hábiles es contado desde que se recepciona la información solicitada completa y
              correcta, cualquier error u omisión implicará una nueva solicitud y el plazo de
              respuesta por nuestra parte se extenderá.
            </p>
            <p>
              NOTA IMPORTANTE: Si no has realizado la apertura de libro (registro de accionistas),
              tienes que agregar el adicional (ver pestaña del lado derecho) que agregará $19.990
              que es el costo de ese servicio (y que es obligatorio de realizar antes de la
              disolución ya que de lo contrario la empresa se encuentra bloqueada para
              modificaciones, transformaciones o disoluciones). En caso de que no lo agregues y deba
              realizarse, se te contactará para que puedas realizar el pago y esto puede retrasar
              todo el proceso.
            </p>
            <div className="flex flex-row justify-center items-center">
              <NumberInput value={count} onChange={setCount} min={0} max={100} step={1} />
              <Tooltip
                content="Si la modificación requiere incorporar o eliminar socios o cambiar la
                  participación que los mismos tienen de la empresa en porcentaje, se debe sumar a
                  este valor las respectivas compraventas de participación societaria.">
                <div className="flex items-center justify-center rounded-full text-primary">
                  <span>Compraventa (+$35.000)</span>
                  <Info className="w-5 h-5 inline" />
                </div>
              </Tooltip>
            </div>
            <div className="w-full max-w-xl mt-4 border rounded-xl p-4 bg-white shadow-sm">
              <p className="text-md font-semibold mb-2">Agregar servicios adicionales</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={includeShareholdersRegistry}
                  onChange={(e) => setIncludeShareholdersRegistry(e.target.checked)}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    Registro de accionistas (apertura de libro)
                  </span>
                  <span className="text-xs text-gray-600">x1 (+$19.990)</span>
                </div>
              </label>
            </div>

            <PlanSelector
              plans={plans.map((it) => ({
                ...it,
                onClick: () => {
                  setOpenMethodModal(true);
                },
              }))}
              showInclude={true}
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
            count={count}
            companyId={companyId}
            serviceCode={'company_modifications_spa'}
            folio={paymentIntentId}
            goTo={'legal_services/company_modifications_spa'}
          />
        </Switch.Item>
      </Switch>
    </>
  );
});

export default PayCompanyModificationsSpa;
