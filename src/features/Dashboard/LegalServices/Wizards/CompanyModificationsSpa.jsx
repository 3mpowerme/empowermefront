import React from 'react';
import { WizardProvider } from '../../../../context/WizardContext/WizardProvider';
import WizardForm from '../../../../components/WizardForm/WizardForm';

export default function CompanyModificationsSpa({
  handleWizardClose,
  handleWizardSuccess,
  companyId,
}) {
  const getConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para registro de accionistas',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Necesitas realizar la apertura de libro para una Sociedad por Acciones para cumplir con las obligaciones emanadas de la entrada en vigencia de la ley 20.659? En EmpowerMe podemos ayudarte, revisa los detalles y contrata 100% online.',
        footer:
          'Para realizar el proceso se requiere OBLIGATORIAMENTE ingresar a www.registrodeempresasysociedades.cl con rut y clave única de uno de los accionistas de la empresa. Sugerimos que antes de ingresarla, verifiques que es correcta en: https://claveunica.gob.cl/ Si la empresa tiene más de 1 representante legal, basta con 1, recuerde que un socio o accionista de una empresa NO necesariamente es el representante legal.',
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
        title: 'Información para registro de accionistas',
        subtitle: 'Complete toda la información solicitada',
        description:
          '¿Necesitas realizar la apertura de libro para una Sociedad por Acciones para cumplir con las obligaciones emanadas de la entrada en vigencia de la ley 20.659? En EmpowerMe podemos ayudarte, revisa los detalles y contrata 100% online.',
        image: '/images/dashboard/legal_services/shareholders_registry_3.png',
        fields: [
          {
            name: 'legal_representatives',
            label: 'Representante legal*',
            type: 'legal_representative',
          },
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
