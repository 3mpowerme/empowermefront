import React from 'react';
import { WizardProvider } from '../../../../context/WizardContext/WizardProvider';
import WizardForm from '../../../../components/WizardForm/WizardForm';

export default function ConstitutionReviewWizard({
  handleWizardClose,
  handleWizardSuccess,
  companyId,
}) {
  const getConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para revisión de Constitución de Empresas',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Quieres saber si tu empresa está bien constituida y no tendrá problemas para operar formalmente? En EmpowerMe ofrecemos servicio de revisión de los estatutos de tu empresa (exclusivo para empresas constituidas en www.registrodemempresasysociedades.cl o Empresaen1día, si creaste tu empresa con el sistema tradicional en papel no realizamos este tipo de revisiones).',
        image: '/images/dashboard/legal_services/constitution_review_1.png',
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
            name: 'legal_representatives',
            label: 'Representante legal*',
            type: 'legal_representative_2',
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Información para revisión de Constitución de Empresas',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Quieres saber si tu empresa está bien constituida y no tendrá problemas para operar formalmente? En EmpowerMe ofrecemos servicio de revisión de los estatutos de tu empresa (exclusivo para empresas constituidas en www.registrodemempresasysociedades.cl o Empresaen1día, si creaste tu empresa con el sistema tradicional en papel no realizamos este tipo de revisiones).',
        image: '/images/dashboard/legal_services/constitution_review_2.png',
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
  return (
    <WizardProvider
      onlyCreate
      stepsConfig={getConfig()}
      globalSubmitApi={{ method: 'POST', url: `/constitution-review-request/${companyId}` }}
      successMessage="Por favor elige el plan que se mejor se adapte a ti"
      successButton={{}}
      errorMessage="La solicitud no pudo ser procesada"
      onSuccess={handleWizardSuccess}>
      <WizardForm onClose={handleWizardClose} />
    </WizardProvider>
  );
}
