import React from 'react';
import { WizardProvider } from '../../../../context/WizardContext/WizardProvider';
import WizardForm from '../../../../components/WizardForm/WizardForm';
import { useAccount } from '../../../../hooks/useAccount';

export default function CompanyPurchaseSaleWizard({ handleWizardClose, handleWizardSuccess }) {
  const { activeCompany: companyId } = useAccount();
  const getConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para compraventa',
        subtitle: 'Complete  toda la información solicitada',
        image: '/images/dashboard/legal_services/shareholders_registry_2.png',
        fields: [
          {
            name: 'company_name',
            label: 'Razón Social de la Empresa*',
            placeHolder: 'Ingresa Razón Social de la Empresa',
            type: 'text',
            required: true,
          },
          {
            name: 'company_tax_id',
            label: 'RUT de la empresa*',
            placeHolder: 'Ingresa RUT de la Empresa',
            type: 'text',
            required: true,
          },
          {
            name: 'shareholders',
            label: 'Socios/accionistas*',
            type: 'shareholders_4',
            required: true,
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Información para compraventa',
        subtitle: 'Complete  toda la información solicitada',
        image: '/images/dashboard/legal_services/shareholders_registry_3.png',
        fields: [
          {
            name: 'sold_percentage_or_shares',
            label: 'Porcentaje de propiedad/cantidad de acciones (según sea el caso) que se vende*',
            type: 'text',
            required: true,
          },
          {
            name: 'purchase_sale_price',
            label:
              'Precio compraventa (indique el precio en que se va a vender la participación de la empresa)*',
            type: 'text',
            required: true,
          },
          {
            name: 'buyer_full_name',
            label: 'Nombre completo del comprador*',
            type: 'text',
            required: true,
          },
          {
            name: 'buyer_tax_id',
            label: 'Rut del comprador*',
            type: 'text',
            required: true,
          },
          {
            name: 'buyer_address_region_commune',
            label: 'Dirección/comuna/región comprador*',
            type: 'text',
            required: true,
          },
          {
            name: 'buyer_nationality',
            label: 'Nacionalidad comprador*',
            type: 'text',
            required: true,
          },
          {
            name: 'buyer_marital_status',
            label: 'Estado civil comprador*',
            type: 'text',
            required: true,
          },
          {
            name: 'buyer_occupation',
            label: 'Profesión/oficio/ocupación comprador*',
            type: 'text',
            required: true,
          },
          {
            name: 'buyer_email',
            label: 'Correo electrónico comprador*',
            type: 'email',
            required: true,
          },
        ],
      },
      {
        id: 'step-3',
        title: 'Información para compraventa',
        subtitle: 'Complete  toda la información solicitada',
        image: '/images/dashboard/legal_services/shareholders_registry_2.png',
        fields: [
          {
            name: 'seller_full_name',
            label: 'Nombre completo del vendedor*',
            type: 'text',
            required: true,
          },
          {
            name: 'seller_tax_id',
            label: 'Rut del vendedor*',
            type: 'text',
            required: true,
          },
          {
            name: 'seller_address_region_commune',
            label: 'Dirección/comuna/región vendedor*',
            type: 'text',
            required: true,
          },
          {
            name: 'seller_nationality',
            label: 'Nacionalidad vendedor*',
            type: 'text',
            required: true,
          },
          {
            name: 'seller_marital_status',
            label: 'Estado civil vendedor*',
            type: 'text',
            required: true,
          },
          {
            name: 'seller_occupation',
            label: 'Profesión/oficio/ocupación vendedor*',
            type: 'text',
            required: true,
          },
          {
            name: 'seller_email',
            label: 'Correo electrónico vendedor*',
            type: 'email',
            required: true,
          },
        ],
      },
      {
        id: 'step-4',
        title: 'Información para compraventa',
        subtitle: 'Complete  toda la información solicitada',
        image: '/images/dashboard/legal_services/shareholders_registry_3.png',
        fields: [
          {
            name: 'contact_person_name',
            label: 'Nombre persona de contacto para el proceso*',
            placeHolder: 'Ingresa nombre de persona de contacto',
            type: 'text',
            required: true,
          },
          {
            name: 'contact_person_email',
            label: 'Correo persona de contacto para el proceso*',
            placeHolder: 'Ingresa correo electrónico de persona de contacto',
            type: 'email',
            required: true,
          },
          {
            name: 'contact_person_phone',
            label: 'Teléfono personal persona de contacto para el proceso*',
            placeHolder: 'Ingresa móvil de persona de contacto',
            type: 'phone',
            required: true,
          },
          {
            name: 'seller_rut_unique_key',
            label: 'rut y clave única de a lo menos uno de los vendedores*',
            type: 'text',
            required: true,
          },
        ],
      },
    ];
  };

  return (
    <WizardProvider
      onlyCreate
      stepsConfig={getConfig()}
      globalSubmitApi={{
        method: 'POST',
        url: `/purchase-sale-request/${companyId}`,
      }}
      successMessage="El formulario se guardo correctamente"
      successButton={{}}
      errorMessage="La solicitud no pudo ser procesada"
      onSuccess={handleWizardSuccess}>
      <WizardForm onClose={handleWizardClose} />
    </WizardProvider>
  );
}
