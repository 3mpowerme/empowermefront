import React, { useRef } from 'react';
import CardSelector from '../../components/CardSelector/CardSelector';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import { useCustomerServiceChannel } from '../../hooks/useCustomerServiceChannel';
import { useCompanyOffering } from '../../hooks/useCompanyOffering';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../utils/storage';

const BuildCompanyWizardStep3 = ({ name }) => {
  const currentOptionRef = useRef({});
  const { setStepState } = useBuildCompany();

  const buildCompanyFromStorage = storage.getItem('buildCompany') || {};
  const {
    step3: {
      customerServiceChannel: customerServiceChannelFromStorage,
      companyOffering: companyOfferingFromStorage,
    } = {},
  } = buildCompanyFromStorage;

  const { customerServiceChannel, isLoading: isLoadingCustomerService } =
    useCustomerServiceChannel();
  const { companyOffering, isLoading: isLoadingCompanyOffering } = useCompanyOffering();

  const handleCardChangeCompanyOffering = (ids) => {
    currentOptionRef.current = { ...currentOptionRef.current, companyOffering: ids };
    setStepState(3, { ...currentOptionRef.current, canContinue: true });
  };

  const handleCardChangeCustomerServiceChannel = (ids) => {
    currentOptionRef.current = { ...currentOptionRef.current, customerServiceChannel: ids };
    setStepState(3, { ...currentOptionRef.current, canContinue: true });
  };

  if (isLoadingCustomerService && isLoadingCompanyOffering) {
    return <FullScreenSpinner />;
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-5 md:py-0 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center">
        <h1 className="font-bold text-2xl sm:text-3xl md:text-3xl text-black">
          ¿Qué ofrece {name}?
        </h1>
        <p className="text-base sm:text-lg text-gray-700">Elige todas las que correspondan</p>
      </div>

      <div className="w-full max-w-5xl">
        <CardSelector
          initialValues={companyOfferingFromStorage}
          multiple
          cards={companyOffering}
          columns={1}
          onCardChange={handleCardChangeCompanyOffering}
        />
      </div>

      <div className="w-full max-w-4xl text-center mt-6">
        <h1 className="font-bold text-2xl sm:text-3xl md:text-3xl text-black">
          ¿Dónde atenderás a tus clientes?
        </h1>
        <p className="text-base sm:text-lg text-gray-700">Elige todas las que correspondan</p>
      </div>

      <div className="w-full max-w-5xl">
        <CardSelector
          initialValues={customerServiceChannelFromStorage}
          multiple
          cards={customerServiceChannel}
          columns={1}
          onCardChange={handleCardChangeCustomerServiceChannel}
        />
      </div>
    </div>
  );
};

export default BuildCompanyWizardStep3;
