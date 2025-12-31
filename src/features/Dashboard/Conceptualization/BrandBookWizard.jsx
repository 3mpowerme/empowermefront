import react, { useEffect, forwardRef } from 'react';
import ConceptualizationWizardStep5 from './ConceptualizationWizardStep5';
import ConceptualizationWizardStep6 from './ConceptualizationWizardStep6';
import { useConceptualization } from '../../../hooks/useConceptualization';
import { privateService } from '../../../services/privateService';
import { mapArrayToColorimetry, mapArrayToOptions } from '../../../utils/catalogs';
import Wizard from '../../../components/Wizard/Wizard';
import { useApp } from '../../../hooks/useApp';

const BrandBookWizard = forwardRef(
  ({ onClose = () => {}, onComplete = () => {}, conceptualization }, brandBookIdRef) => {
    const { setIsLoading } = useApp();
    const {
      state: { step2, step3, step5, step6, conceptualizations = [] } = {},
      setBrandBookOptions,
      setIsMarketAnalysisLoading,
      setLogos,
    } = useConceptualization();

    const handleContinue = (stepNumber) => {
      console.log('stepNumber', stepNumber);
      if (stepNumber === 1) {
        const { brand_name, slogan, logo_type, colorimetry, colorimetry_name } = step5 || {};
        if (brand_name && slogan && logo_type && colorimetry) {
          setIsMarketAnalysisLoading(true);
          privateService
            .create('/conceptualization/brand-book', {
              brand_name,
              slogan,
              logo_type,
              colorimetry,
              colorimetry_name,
              conceptualization_id: conceptualization.conceptualization_id,
            })
            .then((response) => {
              if (response?.logos) setLogos(response.logos);
              if (brandBookIdRef) brandBookIdRef.current = response?.brand_book_id;
            })
            .finally(() => {
              setIsMarketAnalysisLoading(false);
            });
        }
      }
    };

    const handleComplete = () => {
      onComplete();
      onClose();
    };

    const steps = [
      { id: 5, component: <ConceptualizationWizardStep5 /> },
      { id: 6, component: <ConceptualizationWizardStep6 /> },
    ];

    useEffect(() => {
      setIsLoading(true);
      privateService
        .create('/conceptualization/brand-book-options', {
          offering_service_type_id: [conceptualization.offering_service_type_id],
          about: conceptualization.about,
          business_sector_id: conceptualization.business_sector_id,
          region_id: conceptualization.region_id,
        })
        .then((brandBookOptions) => {
          setBrandBookOptions({
            brandNames: mapArrayToOptions(brandBookOptions.brandNames),
            slogans: mapArrayToOptions(brandBookOptions.slogans),
            colorimetries: mapArrayToColorimetry(brandBookOptions.colorimetries),
          });
        })
        .catch((error) => {
          console.error('Erro getting brand book options', error);
          onClose();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, []);

    return (
      <div className="mx-auto w-full px-5 py-6 sm:py-8 md:py-10">
        <Wizard
          onClose={onClose}
          showProgress
          steps={steps}
          onContinue={handleContinue}
          onComplete={handleComplete}
          firstStepButtonText="Empezar"
          hidePreviousStepInStep={[2]}
          withCanContinue
        />
      </div>
    );
  }
);

export default BrandBookWizard;
