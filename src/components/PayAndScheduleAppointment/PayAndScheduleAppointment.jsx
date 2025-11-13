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
import SuccessfullSubscription from './SuccessfullSubscription';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_APPOINTMENT_VIEW = 'pay-appointment-view';
const PAY_WITH_STRIPE_VIEW = 'pay-with-stripe-view';
const SCHEDULE_APPOINTMENT_VIEW = 'schedule-appointment-view';
const SUCCESSFULL_SUBSCRIPTION_VIEW = 'successfull-subscription-view';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PayAndScheduleAppointment = forwardRef(
  ({ onComplete = () => {}, type = 'subscription' }, ref) => {
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
    const { plan } = useServicePlan(ref.current.serviceType);
    console.log('plan', plan);
    const { setToast } = useApp();
    const navigate = useNavigate();

    const ensureServiceOrder = async () => {
      if (ref.current?.serviceOrderId) return ref.current.serviceOrderId;
      const res = await privateService.create('/payments/service-order', {
        serviceCode: ref.current.serviceType,
        companyId,
      });
      if (res?.serviceOrderId) {
        ref.current = { ...(ref.current || {}), serviceOrderId: res.serviceOrderId };
        return res.serviceOrderId;
      }
      throw new Error('No se pudo crear la orden de servicio');
    };

    const startStripePayment = async () => {
      try {
        if (type === 'subscription') {
          const { clientSecret, planName, priceSummary, subscriptionId } =
            await privateService.create('/subscription', {
              companyId,
              planId: selectedPlan.id,
            });
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
        } else {
          const serviceOrderId = await ensureServiceOrder();
          console.log('serviceOrderId', serviceOrderId);
          const { clientSecret } = await privateService.create('/payments/create-intent', {
            serviceOrderId,
          });
          console.log('clientSecret', clientSecret);
          setClientSecret(clientSecret);
          setView(PAY_WITH_STRIPE_VIEW);
          setOpenStripeModal(true);
        }
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
        message: 'Se realizó tu pago con exito, por favor agenda tu cita',
        button: {},
        type: 'success',
      });
      setOpenStripeModal(false);
      setOpenMethodModal(false);
      if (type === 'subscription') {
        setView(SUCCESSFULL_SUBSCRIPTION_VIEW);
      } else {
        setView(SCHEDULE_APPOINTMENT_VIEW);
      }
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
      { value: 'month-6', label: 'Semestral' },
      { value: 'year', label: 'Anual' },
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
            }))
        : plan
            .filter((p) => p.how_often === 'year')
            .map((it) => ({
              ...it,
              onClick: () => {
                setSelectedPlan(it);
                setOpenMethodModal(true);
              },
            }));
    }, [optionSelected, plan]);

    useEffect(() => {
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
                Elige el paquete que mejor se adapte a las necesidades de tu negocio.
              </p>
              <div className="w-1/2: md:1/3">
                <Select options={planOptions} onChange={handleChange} value={optionSelected} />
              </div>

              <PlanSelector plans={filteredPlans} />

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
                      { id: 1, image: '/images/dashboard/payment/paypal.png' },
                      { id: 2, image: '/images/dashboard/payment/webpay.png' },
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
              {type === 'subscription' ? (
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
              ) : (
                <StripePaymentModal
                  open={openStripeModal}
                  onClose={() => {
                    setOpenStripeModal(false);
                    setView(PAY_APPOINTMENT_VIEW);
                  }}
                  clientSecret={clientSecret}
                  onSuccess={onStripeSuccess}
                />
              )}
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
            <SuccessfullSubscription
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
  }
);

export default PayAndScheduleAppointment;
