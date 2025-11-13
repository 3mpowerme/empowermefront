import { ArrowBigLeft } from 'lucide-react';
import Tabs from '../../../components/Tabs/Tabs';
import { useSearchParams } from 'react-router';
import BrandBook from './BrandBook';
import MarketAnalysis from './MarketAnalysis';
import BusinessPlan from './BusinessPlan';
import Mockups from './Mockups';
import classNames from 'classnames';

const ConceptualizationDetails = ({
  hideTitle = false,
  conceptualization,
  goBack,
  refetchConceptualizations = () => {},
}) => {
  console.log('Conceptualization conceptualization', conceptualization);
  const [searchParams] = useSearchParams();
  const sub = searchParams.get('sub');
  const tabs = [
    {
      id: 'brand-book',
      label: 'BrandBook',
      content: (
        <BrandBook
          brandName={conceptualization?.brand_name}
          slogan={conceptualization?.slogan}
          logoUrl={conceptualization?.logo_url}
          colorimetry={conceptualization?.colorimetry}
          businessSector={conceptualization?.business_sector_name}
          region={conceptualization?.region_name}
          offeringServiceType={conceptualization?.offering_service_type_name}
          about={conceptualization?.about}
          colorimetryName={conceptualization?.colorimetry_name}
        />
      ),
    },
    {
      id: 'market-analysis',
      label: 'Análisis de viabilidad',
      content: (
        <MarketAnalysis data={conceptualization?.market_analysis_raw_result} showDownloadPDF />
      ),
    },
    {
      id: 'business plan',
      label: 'Plan de negocios',
      content: (
        <BusinessPlan
          data={conceptualization?.business_plan_raw_result}
          requestData={{
            business_sector_id: conceptualization?.business_sector_id,
            region_id: conceptualization?.region_id,
            about: conceptualization?.about,
            offering_service_type_id: conceptualization?.offering_service_type_id,
          }}
          conceptualizationId={conceptualization?.conceptualization_id}
          showDownloadPDF
        />
      ),
    },
    {
      id: 'mockups',
      label: 'Mockups',
      content: (
        <Mockups
          conceptualization_id={conceptualization?.conceptualization_id}
          business_sector_id={conceptualization?.business_sector_id}
          region_id={conceptualization?.region_id}
          about={conceptualization?.about}
          offering_service_type_id={conceptualization?.offering_service_type_id}
          brand_book_id={conceptualization?.brand_book_id}
          mockups={conceptualization?.business_cards}
          refetchConceptualizations={refetchConceptualizations}
        />
      ),
    },
  ];
  return (
    <div
      className={classNames('flex flex-col h-full w-full gap-5', {
        'pl-10 mt-10 animate-slide-in': !hideTitle,
      })}>
      {!hideTitle && (
        <h2 className="text-lg font-semibold print:hidden">
          <span className="mr-2">
            <button className="cursor-pointer" onClick={goBack}>
              <ArrowBigLeft size={15} />
            </button>
          </span>
          Resumen de su idea
        </h2>
      )}
      <Tabs tabs={tabs} initialTab={sub} />
    </div>
  );
};

export default ConceptualizationDetails;
