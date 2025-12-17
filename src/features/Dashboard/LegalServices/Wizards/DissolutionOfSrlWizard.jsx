import React from 'react';
import { WizardProvider } from '../../../../context/WizardContext/WizardProvider';
import WizardForm from '../../../../components/WizardForm/WizardForm';

export default function DissolutionOfSrlWizard({
  handleWizardClose,
  handleWizardSuccess,
  companyId,
}) {
  const getConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para disolución de SRL',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Necesitas terminar una Sociedad de Responsabilidad Limitada (SRL)? Si creaste tu empresa en el Registro de Empresas y Sociedades o la migraste al mismo (Empresaen1día), podemos ayudarte a disolverla (si la creaste en el sistema tradicional, en papel, no trabajamos con empresas que pertenezcan a ese registro para este servicio).',
        image: '/images/dashboard/legal_services/dissolution_of_srl_1.png',
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
            type: 'shareholders',
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Información para disolución de SRL',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Necesitas terminar una Sociedad de Responsabilidad Limitada (SRL)? Si creaste tu empresa en el Registro de Empresas y Sociedades o la migraste al mismo (Empresaen1día), podemos ayudarte a disolverla (si la creaste en el sistema tradicional, en papel, no trabajamos con empresas que pertenezcan a ese registro para este servicio).',
        image: '/images/dashboard/legal_services/dissolution_of_srl_2.png',
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
        ],
      },
    ];
  };
  const serviceCode = 'dissolution_of_srl';
  return (
    <WizardProvider
      onlyCreate
      stepsConfig={getConfig()}
      globalSubmitApi={{ method: 'POST', url: `/dissolution-request/${companyId}/${serviceCode}` }}
      successMessage="Por favor elige el plan que se mejor se adapte a ti"
      successButton={{}}
      errorMessage="La solicitud no pudo ser procesada"
      onSuccess={handleWizardSuccess}>
      <WizardForm onClose={handleWizardClose} />
    </WizardProvider>
  );
}
