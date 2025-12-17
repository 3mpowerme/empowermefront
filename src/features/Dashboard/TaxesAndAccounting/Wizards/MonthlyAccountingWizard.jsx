import React from 'react';
import { WizardProvider } from '../../../../context/WizardContext/WizardProvider';
import WizardForm from '../../../../components/WizardForm/WizardForm';
import { mapCatalogToOptions } from '../../../../utils/catalogs';

export default function MonthlyAccountingWizard({
  handleWizardClose,
  handleWizardSuccess,
  companyId,
  commercialMovements,
  hasStartedActivities,
}) {
  const getTaxesAndAccountingWizardConfig = () => {
    return [
      {
        id: 'step-1',
        title: 'Pasos para ingresar como cliente para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description:
          'La contabilidad y el cumplimiento tributario son las áreas más sensibles de cualquier empresa, ya que un manejo inadecuado de las mismas puede derivar en multas y malos ratos innecesarios, cuando podrías haber llevado todo en orden y en regla con nosotros.',
        image: '/images/dashboard/taxes_and_accounting/monthly_accounting_1.jpg',
        fields: [
          {
            name: 'email',
            label: 'Correo electrónico*',
            placeHolder: 'Ingresa correo electrónico',
            type: 'email',
            required: true,
          },
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
            name: 'company_contact_phone',
            label: 'Teléfono de contacto de la empresa*',
            placeHolder: 'Ingresa teléfono de contacto de la empresa',
            type: 'phone',
            required: true,
          },
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
        ],
      },
      {
        id: 'step-2',
        title: 'Pasos para ingresar como cliente para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description:
          'La contabilidad y el cumplimiento tributario son las áreas más sensibles de cualquier empresa, ya que un manejo inadecuado de las mismas puede derivar en multas y malos ratos innecesarios, cuando podrías haber llevado todo en orden y en regla con nosotros.',
        image: '/images/dashboard/taxes_and_accounting/monthly_accounting_2.jpg',
        fields: [
          {
            name: 'legal_representative_phone',
            label: 'Teléfono del representante legal*',
            placeHolder: 'Ingresa teléfono del representante legal',
            type: 'phone',
            required: true,
          },
          hasStartedActivities === 'NO'
            ? {
                name: 'need_activity_start_support',
                label: 'Necesitas apoyo con el inicio de actividades*',
                type: 'radio',
                options: [
                  {
                    value: 'SI',
                    label: 'Si',
                  },
                  {
                    value: 'NO',
                    label: 'No',
                  },
                ],
                required: true,
              }
            : null,
          {
            name: 'commercial_movements',
            label:
              '¿Qué tipo de movimientos comerciales tiene su empresa? marque todas las que correspondan*',
            type: 'radio',
            options: mapCatalogToOptions(commercialMovements),
            required: true,
            multiple: true,
          },
        ].filter(Boolean),
      },
    ];
  };
  return (
    <WizardProvider
      onlyCreate
      stepsConfig={getTaxesAndAccountingWizardConfig()}
      globalSubmitApi={{ method: 'POST', url: `/monthly-accounting/${companyId}` }}
      successMessage="Por favor elige el plan que se mejor se adapte a ti"
      successButton={{}}
      errorMessage="La solicitud no pudo ser procesada"
      onSuccess={handleWizardSuccess}>
      <WizardForm onClose={handleWizardClose} />
    </WizardProvider>
  );
}
