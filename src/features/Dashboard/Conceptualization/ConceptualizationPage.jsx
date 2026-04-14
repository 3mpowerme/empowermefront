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
import { Link, useNavigate } from 'react-router';
import BrandBookWizard from './BrandBookWizard';
import { useBuildCompany } from '../../../hooks/useBuildCompany';

const LOADING_VIEW = 'loading-view';
const ERROR_VIEW = 'error-view';
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

const ConceptualizationPage = ({ showWelcomeMessage = false }) => {
  const { activeCompanyInfo } = useAccount();
  const { companyName = '' } = activeCompanyInfo || {};
  const {
    state: { step2, step3, step5, step6, conceptualizations = [] } = {},
    setIsMarketAnalysisLoading,
    setMarketAnalysis,
    setBrandBookOptions,
    setLogos,
    refetch,
  } = useConceptualization();
  const navigate = useNavigate();
  const { setIsLoading, setToast } = useApp();
  const conceptualizationIdRef = useRef(null);
  const brandBookIdRef = useRef(null);
  const [view, setView] = useState(LOADING_VIEW);
  const [selectedConceptualization, setSelectedConceptualization] = useState(null);
  useEffect(() => {
    if (conceptualizations.length === 0) {
      navigate('/dashboard/conceptualization/pay', { state: { withAutoContinue: false } });
    } else {
      setView(CONCEPTUALIZATIONS_VIEW);
      if (conceptualizations[0]?.conceptualization_id)
        setSelectedConceptualization(conceptualizations[0].conceptualization_id);
    }
  }, [conceptualizations.length]);

  /*
  useEffect(() => {
    const conceptualizationFromLocalStroage = storage.getItem('conceptualization') || {};
    storage.setItem('conceptualization', {
      ...conceptualizationFromLocalStroage,
      step3: {
        region: `${account?.region_id}`,
        business_sectors: `${account?.business_sector_id}`,
      },
    });
  }, [account]);
  */

  const steps = [
    { id: 1, component: <ConceptualizationWizardStep1 /> },
    { id: 2, component: <ConceptualizationWizardStep2 /> },
    { id: 3, component: <ConceptualizationWizardStep3 /> },
    { id: 4, component: <ConceptualizationWizardStep4 /> },

    { id: 5, component: <ConceptualizationWizardStep5 /> },
    { id: 6, component: <ConceptualizationWizardStep6 /> },
  ];

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

  const handleViewConceptualization = (conceptualizationId) => {
    setSelectedConceptualization(conceptualizationId);
  };

  const handleGoBack = () => {
    setView(CONCEPTUALIZATIONS_VIEW);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#FDECDA]">
      <Switch value={view} defaultChild="">
        <Switch.Item case={LOADING_VIEW}>
          <PageSkeleton />
        </Switch.Item>

        <Switch.Item case={ERROR_VIEW}></Switch.Item>

        <Switch.Item case={NEW_CONCEPTUALIZATION_VIEW}>
          <div className="mx-auto w-full px-5 py-6 sm:py-8 md:py-10">
            <Wizard
              onClose={() => {
                refetch().finally(() => {
                  setView(CONCEPTUALIZATIONS_VIEW);
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
        <Switch.Item case={CONTINUE_CONCEPTUALIZATION_VIEW}>
          <BrandBookWizard
            onClose={() => {
              refetch().finally(() => {
                setView(CONCEPTUALIZATIONS_VIEW);
              });
            }}
            ref={brandBookIdRef}
            conceptualization={
              conceptualizations?.filter(
                (it) => it.conceptualization_id === selectedConceptualization
              )[0]
            }
            onComplete={handleComplete}
          />
        </Switch.Item>

        <Switch.Item case={CONCEPTUALIZATIONS_VIEW}>
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-10 py-6 sm:py-8 md:py-10 animate-slide-in">
            {showWelcomeMessage && (
              <h1 className="text-xl sm:text-2xl md:text-3xl text-black font-bold print:hidden">
                {`Bienvenido ${companyName}`}
              </h1>
            )}
            <h2 className="mt-2 text-lg sm:text-xl md:text-2xl text-black font-bold print:hidden">
              Resumen de ideas conceptualizadas
            </h2>

            {conceptualizations.length < 30 && (
              <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 print:hidden">
                <button
                  className="flex items-center cursor-pointer shadow-xl hover:scale-105 transition-transform"
                  onClick={() => {
                    navigate('/dashboard/conceptualization/pay', {
                      state: { withAutoContinue: false },
                    });
                    //setView(NEW_CONCEPTUALIZATION_VIEW);
                  }}>
                  <p className="text-white text-sm font-semibold bg-primary rounded-xl px-5 py-2 flex items-center">
                    <Plus size={13} className="mr-2" />
                    Nueva Conceptualización
                  </p>
                </button>
                {false && (
                  <button className="flex items-center cursor-pointer shadow-xl hover:scale-105 transition-transform">
                    <p className="text-white text-sm font-semibold bg-primary rounded-xl px-5 py-2 flex items-center">
                      Crear Empresa
                    </p>
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 w-full py-5 print:hidden">
              {conceptualizations.map((conceptualization, i) => (
                <ConceptualizationCard
                  about={conceptualization.about}
                  business_sectors={conceptualization.business_sector_id}
                  showCreateCompanyButton={!!conceptualization.brand_name}
                  key={conceptualization.conceptualization_id || i}
                  isActive={selectedConceptualization === conceptualization.conceptualization_id}
                  name={conceptualization.brand_name}
                  onClick={() =>
                    handleViewConceptualization(conceptualization.conceptualization_id)
                  }
                />
              ))}

              {conceptualizations.length === 0 && (
                <div className="mt-16 border rounded-xl border-opaque w-full h-50 flex justify-center items-center text-secondary">
                  No tienes ideas conceptualizadas
                </div>
              )}

              {conceptualizations.length === 3 && (
                <div className="w-full py-5 flex items-center text-secondary gap-2">
                  <Diamond />
                  Has generado tres ideas para generar más debes actualizar tu plan
                </div>
              )}
            </div>

            {conceptualizations.length !== 0 && (
              <div className="w-full">
                <ConceptualizationDetails
                  hideTitle={false}
                  companyName={companyName}
                  goBack={handleGoBack}
                  conceptualization={
                    conceptualizations?.filter(
                      (it) => it.conceptualization_id === selectedConceptualization
                    )[0]
                  }
                  onConceptualizationContinue={() => {
                    setView(CONTINUE_CONCEPTUALIZATION_VIEW);
                  }}
                  refetchConceptualizations={refetch}
                />
              </div>
            )}
          </div>
        </Switch.Item>

        <Switch.Item case={CONCEPTUALIZATION_DETAILS_VIEW}></Switch.Item>
      </Switch>
    </div>
  );
};

export default ConceptualizationPage;
