import React from 'react';
import { WizardProvider } from '../../../../context/WizardContext/WizardProvider';
import WizardForm from '../../../../components/WizardForm/WizardForm';
import { useAccount } from '../../../../hooks/useAccount';

export default function MonthlyAccountingRequiredDocumentsWizard({
  handleWizardClose,
  handleWizardSuccess,
  needActivityStartSupport,
}) {
  console.log('HERE needActivityStartSupport', needActivityStartSupport);
  const { activeCompany: companyId } = useAccount();
  const getConfig = () => {
    console.log('HERE 2 needActivityStartSupport', needActivityStartSupport);
    const fields = [
      {
        name: 'legal_representative_rut',
        label: 'Rut*',
        placeHolder: 'Ingresa RUT',
        tooltip:
          'de la plataforma del Servicio de Impuestos Internos del representante legal y ante el SII de la empresa',
        type: 'text',
        required: false,
      },
      needActivityStartSupport
        ? null
        : {
            name: 'legal_representative_key',
            label: 'Clave Tributaria*',
            placeHolder: 'Ingresa Clave Tributaria',
            tooltip:
              'de la plataforma del Servicio de Impuestos Internos del representante legal y ante el SII de la empresa',
            type: 'text',
            required: false,
          },
      {
        name: 'activities',
        label: 'Indicar qué actividades económicas desea iniciar.*',
        tooltip:
          'recuerde que sólo puede agregar actividades que realmente comenzará a realizar inmediatamente, puesto que estas se deben acreditar a posterior y de no poderse ello generará problemas con el SII y la imposibilidad de que su empresa pueda operar con normalidad',
        placeHolder:
          'Puedes listar las actividades económicas codificadas del Servicio de Impuestos Internos (en caso de que ya las conozcas), o puedes describir a qué se dedicará tu empresa con tus propias palabras y presionar el botón actividades sugeridas y elegirlas desde ahí',
        type: 'intelligence-text-select',
        endpoint: '/ia',
        required: true,
      },
    ].filter(Boolean);
    console.log('HERE fields', fields);
    return [
      {
        id: 'step-1',
        title: 'Documentos requeridos para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description: '',
        image: '/images/dashboard/taxes_and_accounting/monthly_accounting_1.jpg',
        fields: [
          {
            name: 'company_rut',
            label: 'Rut de la empresa a la que se va a iniciar actividades.',
            placeHolder: 'Ingresa RUT',
            tooltip:
              'en caso de haber sido creada en Empresa en 1 día, omitir esto si es que fue creada con el sistema tradicional ya que en ese caso el rut se obtendrá posterior al inicio de actividades',
            type: 'text',
            required: false,
          },
          {
            name: 'company_statute_or_constitution',
            label: 'Estatuto actualizado o constitución de sociedad*',
            tooltip:
              'de acuerdo a cómo haya constituido su empresa, si fue por Empresa en 1 día es el documento que se descarga al terminar el proceso',
            placeHolder: 'Sube el archivo',
            uploadEndpoint: `/services/accounting/documents/${companyId}/upload-url`,
            maxSize: '20971520',
            type: 'file',
            required: true,
          },
          {
            name: 'proof_of_address',
            label:
              'Documentación para acreditación del domicilio que puede ser cualquiera (1) de las siguientes opciones*',
            placeHolder: 'Sube el archivo',
            type: 'file',
            uploadEndpoint: `/services/accounting/documents/${companyId}/upload-url`,
            maxSize: '20971520',
            required: true,
            fileOptions: [
              {
                label:
                  'Contrato de Arriendo firmado ante Notario que indique uso comercial (no habitacional)',
                tooltip: '',
              },
              {
                label: 'Declaración jurada de cesión de dirección para uso comercial',
                tooltip:
                  'el último en el caso de que vayas a utilizar tu casa o la de un familiar como dirección tributaria y comercial). Es una declaración jurada que se firma en cualquier Notaría, normalmente pueden facilitarle ellos el formato y debe acreditarse la propiedad del inmueble por parte de quien cede con un Certificado de Dominio Vigente de la propiedad que se obtiene en el Conservador de Bienes Raíces donde está inscrita dicha propiedad (si no tiene este documento le recomendamos partir por solicitarlo ya que usualmente los CBR no lo entregan de inmediato.',
              },
              {
                label:
                  'Si es propietario indicar la dirección de la propiedad y rol de avalúo fiscal',
                tooltip:
                  'se obtiene en el mismo sitio web del Servicio de Impuestos Internos entrando a la sesión personal del dueño de la propiedad en la sección Mis Bienes Raíces.',
              },
            ],
          },
        ],
      },
      {
        id: 'step-2',
        title: 'Documentos requeridos para servicios de contabilidad',
        subtitle: 'Complete toda la información solicitada',
        description: '',
        image: '/images/dashboard/taxes_and_accounting/monthly_accounting_2.jpg',
        fields: fields,
      },
    ];
  };

  const config = getConfig();
  console.log('HERE config', config);
  return (
    <WizardProvider
      onlyCreate
      stepsConfig={config}
      globalSubmitApi={{
        method: 'POST',
        url: `/company-monthly-accounting-required-documents/${companyId}`,
      }}
      successMessage="El formulario se guardo correctamente"
      successButton={{}}
      errorMessage="La solicitud no pudo ser procesada"
      onSuccess={handleWizardSuccess}>
      <WizardForm onClose={handleWizardClose} />
    </WizardProvider>
  );
}
