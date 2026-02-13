import React, { useEffect, useMemo, useRef, useState } from 'react';
import Wizard from '../../../components/Wizard/Wizard';
import ConceptualizationWizardStep1 from './ConceptualizationWizardStep1';
import ConceptualizationWizardStep2 from './ConceptualizationWizardStep2';
import ConceptualizationWizardStep3 from './ConceptualizationWizardStep3';
import ConceptualizationWizardStep4 from './ConceptualizationWizardStep4';
import { useConceptualization } from '../../../hooks/useConceptualization';
import { privateService } from '../../../services/privateService';
import { useAccount } from '../../../hooks/useAccount';
import { Diamond, Plus } from 'lucide-react';
import Button from '../../../components/Button/Button';
import ConceptualizationWizardStep5 from './ConceptualizationWizardStep5';
import Switch from '../../../components/Switch/Switch';
import { useApp } from '../../../hooks/useApp';
import PageSkeleton from '../../../components/Skeleton/PageSkeleton';
import ConceptualizationWizardStep6 from './ConceptualizationWizardStep6';
import { mapArrayToColorimetry, mapArrayToOptions } from '../../../utils/catalogs';
import ConceptualizationDetails from './ConceptualizationDetails';
import classNames from 'classnames';
import { useCompanySetup } from '../../../hooks/useCompanySetup';
import { storage } from '../../../utils/storage';
import { Link, useLocation, useNavigate } from 'react-router';
import BrandBookWizard from './BrandBookWizard';
import { useBuildCompany } from '../../../hooks/useBuildCompany';
import { loadStripe } from '@stripe/stripe-js';
import { useServicePlan } from '../../../hooks/useServicePlan';
import PlanSelector from '../../../components/PlanSelector/PlanSelector';
import Modal, { ModalBody, ModalFooter } from '../../../components/Modal/Modal';
import CardSelector from '../../../components/CardSelector/CardSelector';
import StripePaymentModal from '../../../components/stripe/StripePaymentModal';
import { Elements } from '@stripe/react-stripe-js';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
const PAY_VIEW = 'pay-view';
const PAY_WITH_STRIPE_VIEW = 'pay-with-stripe-view';
const CONCEPTUALIZATIONS_VIEW = 'conceptualizations-view';
const NEW_CONCEPTUALIZATION_VIEW = 'new-conceptualization-view';
const CONTINUE_CONCEPTUALIZATION_VIEW = 'continue-conceptualization-view';
const CONCEPTUALIZATION_DETAILS_VIEW = 'conceptualization-details-view';

const ConceptualizationCard = ({
  isActive = false,
  name = '',
  about,
  business_sectors,
  onClick = () => {},
  showCreateCompanyButton = false,
}) => {
  const { setStepState } = useBuildCompany();
  const navigate = useNavigate();
  const trimmedName = useMemo(() => name?.trim(), [name]);
  const goToBuildCompany = () => {
    navigate(`/buildCompany?name=${encodeURIComponent(trimmedName)}`);
    setTimeout(() => {
      setStepState(4, {
        business_sectors: String(business_sectors),
        about,
        business_sector_other: '',
        canContinue: true,
      });
    }, 1000);
  };

  return (
    <div
      className={classNames(
        'flex flex-col sm:flex-row justify-between gap-3 p-4 sm:p-5 rounded-xl bg-black shadow-lg',
        { 'border-b-5 border-primary': isActive }
      )}>
      <div className="flex flex-col">
        <p className="text-primary text-lg sm:text-xl font-semibold">{name}</p>
        {!isActive && (
          <button
            className="text-white text-sm flex flex-row items-center gap-2 cursor-pointer"
            onClick={onClick}>
            Ver conceptualización
          </button>
        )}
      </div>
      {showCreateCompanyButton && (
        /*<Link to="/dashboard/buildCompany">*/
        <button className="flex flex-row items-center cursor-pointer" onClick={goToBuildCompany}>
          <p className="text-white text-sm font-semibold bg-primary rounded-xl px-5 h-9 flex items-center">
            Crear Empresa
          </p>
        </button>
        /*</Link>*/
      )}
    </div>
  );
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PayConceptualizationPage = ({ showWelcomeMessage = false }) => {
  const { activeCompanyInfo } = useAccount();
  const location = useLocation();
  const { withAutoContinue = true } = location.state || {};
  console.log('PayConceptualization withAutoContinue', withAutoContinue);
  const { companyName = '' } = activeCompanyInfo || {};
  const {
    state: { step2, step3, step5, step6, conceptualizations = [] } = {},
    setIsMarketAnalysisLoading,
    setMarketAnalysis,
    setBrandBookOptions,
    setLogos,
    refetch,
  } = useConceptualization();
  const { setIsLoading, setToast } = useApp();
  const conceptualizationIdRef = useRef(null);
  const brandBookIdRef = useRef(null);
  const [view, setView] = useState(LOADING_VIEW);
  const [selectedConceptualization, setSelectedConceptualization] = useState(null);

  const { plan: plans } = useServicePlan('conceptualization');
  const [openMethodModal, setOpenMethodModal] = useState(false);
  const [openStripeModal, setOpenStripeModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState([]);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    //const existingConceptualization = storage.getItem('conceptualization');
    //if (existingConceptualization) {
    setView(PAY_VIEW);
    //} else navigate('/dashboard/conceptualization');
  }, []);

  const steps = [
    { id: 1, component: <ConceptualizationWizardStep1 withAutoContinue={withAutoContinue} /> },
    { id: 2, component: <ConceptualizationWizardStep2 withAutoContinue={withAutoContinue} /> },
    { id: 3, component: <ConceptualizationWizardStep3 withAutoContinue={withAutoContinue} /> },
    { id: 4, component: <ConceptualizationWizardStep4 /> },

    { id: 5, component: <ConceptualizationWizardStep5 /> },
    { id: 6, component: <ConceptualizationWizardStep6 /> },
  ];

  const options = useMemo(
    () => ({
      clientSecret,
      appearance: { theme: 'stripe' },
    }),
    [clientSecret]
  );

  const handleComplete = () => {
    if (step6?.selectedLogo) {
      setIsLoading(true);
      privateService
        .update(`/conceptualization/brand-book/${brandBookIdRef.current}`, {
          logo_id: step6.selectedLogo,
        })
        .then(async (r) => {
          await refetch();
          setToast({
            show: true,
            message: '¡Has conceptualizado tu idea!',
            type: 'success',
          });
          console.log('update brand book logo ', r);
          storage.removeItem('conceptualization');
          navigate('/dashboard/conceptualization');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleContinue = (stepNumber) => {
    if (stepNumber === 3) {
      if (step2?.offeringServiceType && step3?.about && step3?.business_sectors && step3?.region) {
        if (step2?.about && step2.about.length < 10) {
          return;
        }
        setIsMarketAnalysisLoading(true);

        const parsedId = Number(step3.business_sectors);
        const isNumericId = !Number.isNaN(parsedId);

        privateService
          .create('/conceptualization', {
            offering_service_type_id: step2.offeringServiceType,
            about: step3.about,
            business_sector_id: isNumericId ? parsedId : 11,
            business_sector_other: step3?.business_sector_other || '',
            region_id: step3.region,
          })
          .then((conceptualization) => {
            if (conceptualization?.market_analysis) {
              setMarketAnalysis(conceptualization.market_analysis);
            }
            if (conceptualization?.conceptualization_id) {
              conceptualizationIdRef.current = conceptualization.conceptualization_id;
            }
          })
          .catch((error) => {
            setToast({
              show: true,
              message: '¡Ha ocurrido un error!',
              type: 'error',
            });
            handleGoBack();
            console.error('conceptualization error', error);
          })
          .finally(() => {
            setIsMarketAnalysisLoading(false);
          });
      }
    }

    if (stepNumber === 4) {
      if (step2?.offeringServiceType && step3?.about && step3?.business_sectors && step3?.region) {
        setIsMarketAnalysisLoading(true);
        privateService
          .create('/conceptualization/brand-book-options', {
            offering_service_type_id: step2.offeringServiceType,
            about: step3.about,
            business_sector_id: step3.business_sectors,
            region_id: step3.region,
          })
          .then((brandBookOptions) => {
            setBrandBookOptions({
              brandNames: mapArrayToOptions(brandBookOptions.brandNames),
              slogans: mapArrayToOptions(brandBookOptions.slogans),
              colorimetries: mapArrayToColorimetry(brandBookOptions.colorimetries),
            });
          })
          .catch((error) => {
            setToast({
              show: true,
              message: '¡Ha ocurrido un error!',
              type: 'error',
            });
            handleGoBack();
            console.error('Erro getting brand book options', error);
          })
          .finally(() => {
            setIsMarketAnalysisLoading(false);
          });
      }
    }

    if (stepNumber === 5) {
      const { brand_name, slogan, logo_type, colorimetry, colorimetry_name } = step5 || {};
      if (conceptualizationIdRef.current && brand_name && slogan && logo_type && colorimetry) {
        setIsMarketAnalysisLoading(true);
        privateService
          .create('/conceptualization/brand-book', {
            brand_name,
            slogan,
            logo_type,
            colorimetry,
            colorimetry_name,
            conceptualization_id: conceptualizationIdRef.current,
          })
          .then((response) => {
            if (response?.logos) setLogos(response.logos);
            brandBookIdRef.current = response?.brand_book_id;
          })
          .catch((error) => {
            setToast({
              show: true,
              message: '¡Ha ocurrido un error!',
              type: 'error',
            });
            handleGoBack();
            console.error('Erro creating brand book', error);
          })
          .finally(() => {
            setIsMarketAnalysisLoading(false);
          });
      }
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

  const ensureServiceOrder = async () => {
    const payload = {
      serviceCode: 'conceptualization',
      // TODO remove hardcode
      companyId: null,
      count: 1,
    };

    const res = await privateService.create('/payments/service-order', payload);

    if (res?.serviceOrderId) {
      // ref.current = { ...(ref.current || {}), serviceOrderId: res.serviceOrderId };
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
    setView(NEW_CONCEPTUALIZATION_VIEW);
  };

  const handleGoBack = () => {
    setView(ERROR_VIEW);
  };

  return (
    <div className="w-full min-h-screen">
      <Switch value={view} defaultChild="">
        <Switch.Item case={LOADING_VIEW}>
          <PageSkeleton />
        </Switch.Item>

        <Switch.Item case={ERROR_VIEW}>
          <p className="text-red text-center text-2xl">Occurrio un error!</p>
        </Switch.Item>
        <Switch.Item case={PAY_VIEW}>
          <div className="flex flex-col items-center space-y-5 px-6 md:px-10 lg:px-20 mt-10 md:mt-20">
            <h1 className="text-xl font-bold text-center">
              ¿Quieres desbloquear una conceptualización?
            </h1>

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
                setView(PAY_VIEW);
              }}
              clientSecret={clientSecret}
              onSuccess={onStripeSuccess}
            />
          </Elements>
        </Switch.Item>

        <Switch.Item case={NEW_CONCEPTUALIZATION_VIEW}>
          <div className="mx-auto w-full px-5 py-6 sm:py-8 md:py-10">
            <Wizard
              onClose={() => {
                refetch().finally(() => {
                  navigate('/dashboard/conceptualization');
                });
              }}
              showProgress={false}
              steps={steps}
              onContinue={handleContinue}
              onComplete={handleComplete}
              firstStepButtonText="Empezar"
              hidePreviousStepInStep={[4, 5]}
              withCanContinue
            />
          </div>
        </Switch.Item>
        <Switch.Item case={NEW_CONCEPTUALIZATION_VIEW}>
          <div className="mx-auto w-full px-5 py-6 sm:py-8 md:py-10">
            <Wizard
              onClose={() => {
                refetch().finally(() => {
                  navigate('/dashboard/conceptualization');
                });
              }}
              showProgress={false}
              steps={steps}
              onContinue={handleContinue}
              onComplete={handleComplete}
              firstStepButtonText="Empezar"
              hidePreviousStepInStep={[4, 5]}
              withCanContinue
            />
          </div>
        </Switch.Item>
      </Switch>
    </div>
  );
};

export default PayConceptualizationPage;
