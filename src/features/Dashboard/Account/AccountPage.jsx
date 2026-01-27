import React, { useState } from 'react';
import { privateService } from '../../../services/privateService';
import { WizardProvider } from '../../../context/WizardContext/WizardProvider';
import WizardForm from '../../../components/WizardForm/WizardForm';
import { useShareholder } from '../../../hooks/useShareholder';
import global from '../../../constants/global';
import Tabs from '../../../components/Tabs/Tabs';
import ShareholderSection from './ShareholderSection';
import { useApp } from '../../../hooks/useApp';
import { storage } from '../../../utils/storage';
import TaxInfoSection from './ShareholderSection';
import FormSection from './FormSection';
import { useSearchParams } from 'react-router';
import { useAccount } from '../../../hooks/useAccount';
import SubscriptionsList from './SubscriptionsList';
import AccountInfo from './AccountInfo';
import { useRegion } from '../../../hooks/useRegion';
import { mapCatalogToOptions } from '../../../utils/catalogs';

export default function AccountPage() {
  const { refetch } = useShareholder();
  const [state, setState] = useState({
    currentWizardConfig: null,
    globalAPI: '',
    successMessage: '',
    errorMessage: 'La solicitud no pudo ser procesada',
    successButton: {},
  });
  const { region } = useRegion();
  const regions = mapCatalogToOptions(region);
  const [searchParams] = useSearchParams();
  const sub = searchParams.get('sub');
  const { currentWizardConfig, globalAPI, successMessage, errorMessage, successButton } = state;
  const { setToast } = useApp();
  const { activeCompany: companyId } = useAccount();

  const handleWizardClose = () => {
    storage.removeItem(`wizard_form/company-shareholder/${companyId}`);
    setState((prevState) => ({
      ...prevState,
      currentWizardConfig: null,
      globalAPI: '',
      successMessage: '',
    }));
  };

  const handleShareholderSuccess = () => {
    refetch();
    handleWizardClose();
  };

  const tabs = [
    {
      id: 'general',
      label: 'General',
      content: regions.length > 0 ? <AccountInfo companyId={companyId} regions={regions} /> : null,
    },
    {
      id: 'subscriptions',
      label: 'Subscripciones',
      content: <SubscriptionsList />,
    },
    /*{
      id: 'settings',
      label: 'Configuración',
      content: <p>Opciones de configuración</p>,
    },*/
  ];

  return (
    <>
      {currentWizardConfig && (
        <WizardProvider
          onlyCreate
          stepsConfig={currentWizardConfig}
          globalSubmitApi={{ method: 'POST', url: globalAPI }}
          successMessage={successMessage}
          errorMessage={errorMessage}
          successButton={successButton}
          onSuccess={handleShareholderSuccess}>
          <WizardForm onClose={handleWizardClose} />
        </WizardProvider>
      )}
      <div className="flex flex-col h-full w-full gap-5 px-5 md:px-10 animate-slide-in mt-10">
        <h1 className="text-2xl text-black font-bold">Cuenta</h1>
        <Tabs tabs={tabs} initialTab={sub} />
      </div>
    </>
  );
}
