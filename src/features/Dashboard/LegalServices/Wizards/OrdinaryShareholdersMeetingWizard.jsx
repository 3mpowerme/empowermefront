import React from 'react';
import { WizardProvider } from '../../../../context/WizardContext/WizardProvider';
import WizardForm from '../../../../components/WizardForm/WizardForm';

export default function OrdinaryShareholdersMeetingWizard({
  handleWizardClose,
  handleWizardSuccess,
  companyId,
}) {
  const getConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información redactar el acta de la junta ordinaria de accionistas',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Necesitas que redactemos este importante documento por ti, garantizando su tenor y el que podrás protocolizarlo sin problemas en cualquier notaría? En EmpowerMe podemos ayudarte, revisa los detalles y contrata 100% online.',
        footer:
          'Sólo prestamos este servicio a empresas creadas en Empresaen1día (Registro de Empresas y Sociedades) y NO para empresas creadas en el sistema tradicional en papel',
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
            type: 'shareholders_2',
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Información para redactar el acta de la junta ordinaria de accionistas',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Necesitas que redactemos este importante documento por ti, garantizando su tenor y el que podrás protocolizarlo sin problemas en cualquier notaría? En EmpowerMe podemos ayudarte, revisa los detalles y contrata 100% online.',
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
        ],
      },
    ];
  };

  return (
    <WizardProvider
      onlyCreate
      stepsConfig={getConfig()}
      globalSubmitApi={{ method: 'POST', url: `/shareholders-registry-request/${companyId}` }}
      successMessage="Por favor elige el plan que se mejor se adapte a ti"
      successButton={{}}
      errorMessage="La solicitud no pudo ser procesada"
      onSuccess={handleWizardSuccess}>
      <WizardForm onClose={handleWizardClose} />
    </WizardProvider>
  );
}
