import React, { useEffect, useState } from 'react';
import CardSelector from '../../components/CardSelector/CardSelector';
import { useBuildCompany } from '../../hooks/useBuildCompany';
import { useCustomerServiceChannel } from '../../hooks/useCustomerServiceChannel';
import { useCompanyOffering } from '../../hooks/useCompanyOffering';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../utils/storage';
import { useCustomEvent } from '../../hooks/useCustomEvent';

const BuildCompanyWizardStep3 = ({ name }) => {
  const { setStepState } = useBuildCompany();
  const { customerServiceChannel, isLoading: isLoadingCustomerService } =
    useCustomerServiceChannel();
  const { companyOffering, isLoading: isLoadingCompanyOffering } = useCompanyOffering();
  const [showErrors, setShowErrors] = useState(false);

  const buildCompanyFromStorage = storage.getItem('buildCompany') || {};
  const {
    step3: {
      customerServiceChannel: customerServiceChannelFromStorage,
      companyOffering: companyOfferingFromStorage,
    } = {},
  } = buildCompanyFromStorage;

  const [selected, setSelected] = useState({
    companyOffering: companyOfferingFromStorage || [],
    customerServiceChannel: customerServiceChannelFromStorage || [],
  });

  const handleCardChangeCompanyOffering = (ids) => {
    setSelected((prev) => ({ ...prev, companyOffering: ids }));
    setShowErrors(false);
  };

  const handleCardChangeCustomerServiceChannel = (ids) => {
    setSelected((prev) => ({ ...prev, customerServiceChannel: ids }));
    setShowErrors(false);
  };

  useEffect(() => {
    const companyOfferingOk = Array.isArray(selected.companyOffering)
      ? selected.companyOffering.length > 0
      : !!selected.companyOffering;
    const customerServiceChannelOk = Array.isArray(selected.customerServiceChannel)
      ? selected.customerServiceChannel.length > 0
      : !!selected.customerServiceChannel;

    setStepState(3, {
      companyOffering: selected.companyOffering,
      customerServiceChannel: selected.customerServiceChannel,
      canContinue: companyOfferingOk && customerServiceChannelOk,
    });
  }, [selected.companyOffering, selected.customerServiceChannel]);

  useCustomEvent('cannot-continue', () => {
    setShowErrors(true);
  });

  if (isLoadingCustomerService && isLoadingCompanyOffering) {
    return <FullScreenSpinner />;
  }

  const offeringError =
    showErrors &&
    (!Array.isArray(selected.companyOffering) || selected.companyOffering.length === 0);

  const channelError =
    showErrors &&
    (!Array.isArray(selected.customerServiceChannel) ||
      selected.customerServiceChannel.length === 0);

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
          initialValues={selected.companyOffering}
          multiple
          cards={companyOffering}
          columns={1}
          onCardChange={handleCardChangeCompanyOffering}
        />
        {offeringError && (
          <p className="mt-3 text-sm text-red-600 text-center">
            Selecciona al menos una opción para continuar.
          </p>
        )}
      </div>

      <div className="w-full max-w-4xl text-center mt-6">
        <h1 className="font-bold text-2xl sm:text-3xl md:text-3xl text-black">
          ¿Dónde atenderás a tus clientes?
        </h1>
        <p className="text-base sm:text-lg text-gray-700">Elige todas las que correspondan</p>
      </div>

      <div className="w-full max-w-5xl">
        <CardSelector
          initialValues={selected.customerServiceChannel}
          multiple
          cards={customerServiceChannel}
          columns={1}
          onCardChange={handleCardChangeCustomerServiceChannel}
        />
        {channelError && (
          <p className="mt-3 text-sm text-red-600 text-center">
            Selecciona al menos una opción para continuar.
          </p>
        )}
      </div>
    </div>
  );
};

export default BuildCompanyWizardStep3;
