import React from 'react';
import { WizardProvider } from '../../../../context/WizardContext/WizardProvider';
import WizardForm from '../../../../components/WizardForm/WizardForm';

export default function CompanyModificationsSrlWizard({
  handleWizardClose,
  handleWizardSuccess,
  companyId,
}) {
  const getConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Información para modificación de empresa',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Necesitas realizar una modificación en tu empresa? En EmpowerMe podemos ayudarte, revisa los detalles y contrata 100% online.',
        footer:
          'El primer plazo del servicio de modificación de Sociedad de Responsabilidad Limitada de 7 días hábiles es contado desde que se recepciona la información solicitada completa y correcta, cualquier error u omisión implicará una nueva solicitud y el plazo de respuesta por nuestra parte se extenderá.',
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
            type: 'shareholders_3',
            required: true,
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Información para modificación de empresa',
        subtitle: 'Complete  toda la información solicitada',
        description:
          '¿Necesitas realizar una modificación en tu empresa? En EmpowerMe podemos ayudarte, revisa los detalles y contrata 100% online.',
        footer:
          'El primer plazo del servicio de modificación de Sociedad de Responsabilidad Limitada de 7 días hábiles es contado desde que se recepciona la información solicitada completa y correcta, cualquier error u omisión implicará una nueva solicitud y el plazo de respuesta por nuestra parte se extenderá.',
        image: '/images/dashboard/legal_services/shareholders_registry_3.png',
        fields: [
          {
            name: 'legal_representatives',
            label:
              'Representante legal (Indicar todas las personas que tendrán representación legal de la empresa una vez realizada la modificación)*',
            type: 'legal_representative_3',
            tooltip:
              'Recuerde que las personas extranjeras SIN residencia definitiva NO pueden ser representantes legales de una empresa en Chile.',
            required: true,
          },
          {
            name: 'signing_mode',
            label:
              'Posterior a la modificación, desea que todos los representantes deban firmar para todo tipo de trámites o que cada uno pueda actuar de manera independiente representando a la empresa*',
            type: 'radio',
            required: true,
            options: [
              {
                label: 'Que cada representante pueda firmar de manera independiente',
                value: 'Que cada representante pueda firmar de manera independiente',
              },
              {
                label: 'Que todos los representantes deban firmar de manera conjunta',
                value: 'Que todos los representantes deban firmar de manera conjunta',
              },
            ],
          },
          {
            name: 'modifications_description',
            label: 'Describa específicamente qué modificaciones requiere*',
            placeHolder: 'Sea lo más explícito y detallado posible',
            type: 'textare',
            required: true,
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
      globalSubmitApi={{
        method: 'POST',
        url: `/company-modifications-request/${companyId}/company_modifications_srl`,
      }}
      successMessage="Por favor elige el plan que se mejor se adapte a ti"
      successButton={{}}
      errorMessage="La solicitud no pudo ser procesada"
      onSuccess={handleWizardSuccess}>
      <WizardForm onClose={handleWizardClose} />
    </WizardProvider>
  );
}
