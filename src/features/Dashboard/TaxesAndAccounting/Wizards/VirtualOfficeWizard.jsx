import React from 'react';
import { WizardProvider } from '../../../../context/WizardContext/WizardProvider';
import WizardForm from '../../../../components/WizardForm/WizardForm';

export default function VirtualOfficeWizard({
  handleWizardClose,
  handleWizardSuccess,
  companyId,
  serviceCode,
}) {
  const getConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Pasos para ingresar como cliente para oficina virtual',
        subtitle: 'Complete toda la información solicitada',
        description:
          'El servicio de Domicilio Tributario u Oficina Virtual consiste en albergar tu dirección tributaria en nuestro domicilio. Esto dado que cada empresa debe cumplir con esta característica de la normativa que el SII tiene dentro de su proceso de Acreditación de Domicilio y además cumplir con la obligatoriedad de obtención de patente municipal.',
        image: '/images/dashboard/taxes_and_accounting/monthly_accounting_1.jpg',
        fields: [
          {
            name: 'company_tax_id',
            label: 'Rut de la empresa*',
            placeHolder: 'Ingresa el RUT de la empresa',
            type: 'text',
            required: true,
          },

          {
            name: 'company_name',
            label: 'Nombre de la empresa*',
            placeHolder: 'Ingresa el nombre de la empresa',
            type: 'text',
            required: true,
          },
          {
            name: 'company_address',
            label: 'Dirección empresa*',
            placeHolder: 'Ingresa la dirección de la empresa',
            type: 'text',
            required: true,
          },
          {
            name: 'company_commune',
            label: 'Comuna empresa*',
            placeHolder: 'Ingresa la comuna de la empresa',
            type: 'text',
            required: true,
          },
          {
            name: 'company_region',
            label: 'Región empresa*',
            placeHolder: 'Ingresa la región de la empresa',
            type: 'text',
            required: true,
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Pasos para ingresar como cliente para oficina virtual',
        subtitle: 'Complete toda la información solicitada',
        description:
          'El servicio de Domicilio Tributario u Oficina Virtual consiste en albergar tu dirección tributaria en nuestro domicilio. Esto dado que cada empresa debe cumplir con esta característica de la normativa que el SII tiene dentro de su proceso de Acreditación de Domicilio y además cumplir con la obligatoriedad de obtención de patente municipal.',
        image: '/images/dashboard/taxes_and_accounting/monthly_accounting_2.jpg',
        fields: [
          {
            name: 'legal_representative_name',
            label: 'Nombre de representante legal de la empresa*',
            placeHolder: 'Ingresa nombre de representante legal de la empresa',
            type: 'text',
            required: true,
          },
          {
            name: 'legal_representative_tax_id',
            label: 'RUT representante legal de la empresa*',
            placeHolder: 'Ingresa RUT de representante(s) legal(es)',
            type: 'text',
            required: true,
          },
          {
            name: 'legal_representative_address',
            label: 'Dirección representante legal*',
            placeHolder: 'Ingresa la dirección del representante legal',
            type: 'text',
            required: true,
          },
          {
            name: 'legal_representative_commune',
            label: 'Comuna representante legal*',
            placeHolder: 'Ingresa la comuna del representante legal',
            type: 'text',
            required: true,
          },
          {
            name: 'legal_representative_region',
            label: 'Región representante legal*',
            placeHolder: 'Ingresa la región del representante legal',
            type: 'text',
            required: true,
          },
          {
            name: 'legal_representative_profession',
            label: 'Profesión representante legal*',
            placeHolder: 'Ingresa la profesión del representante legal',
            type: 'text',
            required: true,
          },
          {
            name: 'legal_representative_nationality',
            label: 'Nacionalidad representante legal*',
            placeHolder: 'Ingresa la nacionalidad del representante legal',
            type: 'text',
            required: true,
          },
          {
            name: 'legal_representative_civil_status',
            label: 'Estado civil representante legal*',
            type: 'radio',
            required: true,
            multiple: false,
            options: [
              { label: 'Solter@', value: 'SOLTER@' },
              { label: 'Casad@', value: 'CASAD@' },
              { label: 'Separad@', value: 'SOLTER@' },
              { label: 'Viud@', value: 'SOLTER@' },
              { label: 'Conviviente Civil', value: 'CONVIVIENTE CIVIL' },
            ],
          },
          {
            name: 'legal_representative_email',
            label: 'Correo electrónico representante legal*',
            placeHolder: 'Ingresa el correo electrónico del representante legal',
            type: 'email',
            required: true,
          },
          {
            name: 'legal_representative_phone',
            label: 'Teléfono del representante legal*',
            placeHolder: 'Ingresa teléfono del representante legal',
            type: 'phone',
            required: true,
          },
        ].filter(Boolean),
      },
    ];
  };
  return (
    <WizardProvider
      onlyCreate
      stepsConfig={getConfig()}
      globalSubmitApi={{
        method: 'POST',
        url: `/virtual-office-request/${companyId}/${serviceCode}`,
      }}
      successMessage="Por favor elige el plan que se mejor se adapte a ti"
      successButton={{}}
      errorMessage="La solicitud no pudo ser procesada"
      onSuccess={handleWizardSuccess}>
      <WizardForm onClose={handleWizardClose} />
    </WizardProvider>
  );
}
