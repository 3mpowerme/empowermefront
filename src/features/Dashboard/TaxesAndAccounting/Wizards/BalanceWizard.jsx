import React from 'react';
import { WizardProvider } from '../../../../context/WizardContext/WizardProvider';
import WizardForm from '../../../../components/WizardForm/WizardForm';

export default function BalanceWizard({ handleWizardClose, handleWizardSuccess, companyId }) {
  const getCompanyBalanceInfoWizardConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para elaboración de balance',
        subtitle: '(Pre Balance) Complete toda la información solicitada',
        description:
          '¿Necesitas saber cómo va tu empresa en ventas?, ¿calcular cuánto en impuestos deberás pagar en la próxima declaración de renta anual? Es muy importante tener este tipo de información para tomar decisión y prepararte de mejor manera para el cumplimiento de tus obligaciones impositivas y su correcta tributación.',
        image: '/images/dashboard/taxes_and_accounting/balance_1.jpg',
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
            name: 'company_tax_address',
            label: 'Dirección Tributaria de la Empresa',
            placeHolder: 'Ingresa dirección Tributaria de la empresa',
            type: 'text',
            required: true,
          },
          {
            name: 'company_sii_password',
            label: 'Clave Tributaria de la Empresa (para acceder a www.sii.cl) *',
            placeHolder: 'Ingresa Clave Tributaria de la Empresa',
            type: 'text',
            required: true,
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Pasos para ingresar como cliente para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Necesitas revisar la situación tributaria de tu empresa? En Alpha Consulting podemos ayudarte, realizaremos una completa revisión de toda tu situación tributaria y te entregaremos un diagnóstico y si es necesario, un nuevo presupuesto y acciones concretas para lo que haya que subsanar (si es que corresponde subsanar algo).',
        image: '/images/dashboard/taxes_and_accounting/balance_2.jpg',
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
            name: 'legal_representative_sii_password',
            label:
              'Clave Tributaria personal del Representante Legal (para acceder a www.sii.cl) *',
            placeHolder: 'Ingresa Clave Tributaria personal del representante legal de la empresa',
            type: 'text',
            required: true,
          },
        ],
      },
      {
        id: 'step-3',
        title: 'Pasos para ingresar como cliente para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Necesitas revisar la situación tributaria de tu empresa? En Alpha Consulting podemos ayudarte, realizaremos una completa revisión de toda tu situación tributaria y te entregaremos un diagnóstico y si es necesario, un nuevo presupuesto y acciones concretas para lo que haya que subsanar (si es que corresponde subsanar algo).',
        image: '/images/dashboard/taxes_and_accounting/balance_3.jpg',
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
      stepsConfig={getCompanyBalanceInfoWizardConfig()}
      globalSubmitApi={{
        method: 'POST',
        url: `/company-balance-request/${companyId}`,
      }}
      successMessage="Por favor elige el plan que se mejor se adapte a ti"
      successButton={{}}
      errorMessage="La solicitud no pudo ser procesada"
      onSuccess={handleWizardSuccess}>
      <WizardForm onClose={handleWizardClose} />
    </WizardProvider>
  );
}
