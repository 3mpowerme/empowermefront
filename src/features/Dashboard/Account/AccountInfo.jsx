import React from 'react';
import { WizardProvider } from '../../../context/WizardContext/WizardProvider';
import FormSection from './FormSection';

export default function AccountInfo({ companyId, regions }) {
  return (
    <WizardProvider
      stepsConfig={[
        {
          id: 'step-1',
          fields: [
            {
              name: 'about',
              label: 'Acerca de tu negocio*',
              placeHolder: 'Cuéntanos más sobre tu negocio',
              type: 'textarea',
              required: true,
            },
            {
              name: 'region_id',
              label: 'Region de la Empresa*',
              placeHolder: 'Selecciona una región',
              type: 'select',
              options: regions,
              required: true,
            },
            {
              name: 'street',
              label: 'Calle y número*',
              placeHolder: 'Ingresa la calle y número',
              type: 'text',
              required: true,
            },
            {
              name: 'zip_code',
              label: 'Código postal*',
              placeHolder: 'Ingresa el código postal',
              type: 'text',
              required: true,
            },
            {
              name: 'phone_number',
              label: 'Teléfono de contacto de la empresa*',
              placeHolder: 'Ingresa teléfono de contacto de la empresa',
              type: 'phone',
              required: true,
            },
          ],
        },
      ]}
      globalSubmitApi={{ method: 'POST', url: `/account/${companyId}` }}
      successMessage={'La información se guardo correctamente'}
      successButton={{}}
      errorMessage={'La solicitud no pudo ser procesada'}
      loadPrefillAfterFinish
      persistData={false}>
      <div className="md:w-1/2">
        <FormSection />
      </div>
    </WizardProvider>
  );
}
