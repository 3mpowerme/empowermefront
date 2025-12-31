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

  const openShareholderWizard = () => {
    setState((prevState) => ({
      ...prevState,
      currentWizardConfig: getShareholderWizardConfig(),
      globalAPI: `/company-shareholder/${companyId}`,
      successMessage: 'El socio/accionista se guardó correctamente, ¿Quieres agregar otro?',
      successButton: {
        message: 'Agregar',
        onClick: () => {
          openShareholderWizard();
        },
      },
    }));
  };

  const getShareholderWizardConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Pasos para agregar un accionista/socio a tu empresa',
        subtitle: 'Complete toda la información solicitada',
        description:
          'Para poder realizar las siguientes solicitudes necesitas tener registrado al menos un accionista/socio',
        image: '/images/dashboard/legal_services/shareholders_registry_1.jpg',
        fields: [
          {
            name: 'type',
            label: 'Elige si es socio o accionista*',
            placeHolder: 'Elige una opción',
            type: 'select',
            options: [
              { value: 'SOCIO', label: 'Socio' },
              { value: 'ACCIONISTA', label: 'Accionista' },
            ],
            required: true,
          },
          {
            name: 'full_name',
            label: 'Nombre de socio/accionista*',
            placeHolder: 'Ingresa el nombre de socio/accionista',
            type: 'text',
            required: true,
          },
          {
            name: 'rut',
            label: 'RUT de socio/accionista*',
            placeHolder: 'Ingresa el RUT de socio/accionista',
            type: 'text',
            required: true,
          },
          {
            name: 'address',
            label: 'Dirección de socio/accionista*',
            placeHolder: 'Ingresa la dirección de socio/accionista',
            type: 'text',
            required: true,
          },
          {
            name: 'phone',
            label: 'Teléfono de socio/accionista*',
            placeHolder: 'Ingresa el teléfono de socio/accionista',
            type: 'text',
            required: true,
          },
          {
            name: 'profession',
            label: 'Profesión de socio/accionista*',
            placeHolder: 'Ingresa la profesión de socio/accionista',
            type: 'text',
            required: true,
          },
          {
            name: 'email',
            label: 'Correo electrónico de socio/accionista*',
            placeHolder: 'Ingresa correo electrónico de socio/accionista',
            type: 'email',
            required: true,
          },
          {
            name: 'nationality',
            label: 'Nacionalidad de socio/accionista*',
            placeHolder: 'Ingresa correo electrónico de socio/accionista',
            type: 'select',
            options: global.nationalityOptions,
            required: true,
          },
          {
            name: 'unique_key',
            label: 'Clave única de socio/accionista*',
            placeHolder: 'Ingresa la clave única de socio/accionista',
            type: 'text',
            required: true,
          },
        ],
      },
    ];
  };

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

  const deleteShareholder = (id) => {
    console.log('delete id', id);
    privateService
      .delete(`/company-shareholder/${id}`)
      .then(() => {
        setToast({
          show: true,
          message: 'El socio/accionista se borro correctamente',
          type: 'success',
        });
        refetch();
      })
      .catch((error) => {
        console.error('error deleting shareholder', error);
        setToast({
          show: true,
          message: 'El socio/accionista no se borro correctamente',
          type: 'error',
        });
      });
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
