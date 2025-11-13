import React, { useEffect, useState, useRef } from 'react';
import Button from '../../../components/Button/Button';
import { FileText, Printer } from 'lucide-react';
import { privateService } from '../../../services/privateService';
import { useApp } from '../../../hooks/useApp';
import BusinessPlanView from './BusinessPlanView';

export default function BusinessPlan({
  data,
  showDownloadPDF = false,
  requestData,
  conceptualizationId,
}) {
  const [state, setState] = useState(data);
  const [printMode, setPrintMode] = useState(false);
  const { setIsLoading } = useApp();
  const containerRef = useRef(null);

  useEffect(() => {
    setState(data);
  }, [data]);

  const handleCreateBusinessPlan = () => {
    setIsLoading(true);
    privateService
      .create(`/conceptualization/business-plan/${conceptualizationId}`, requestData)
      .then((businessPlanResponse) => {
        if (businessPlanResponse?.business_plan) setState(businessPlanResponse.business_plan);
      })
      .catch((error) => {
        console.error('Error creating business plane', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const forceResize = () => {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  };

  useEffect(() => {
    const onBeforePrint = () => {
      setPrintMode(true);
      if (containerRef.current) {
        containerRef.current.classList.add('allow-overflow');
      }
      forceResize();
    };
    const onAfterPrint = () => {
      setPrintMode(false);
      if (containerRef.current) {
        containerRef.current.classList.remove('allow-overflow');
      }

      forceResize();
    };

    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);

    const mql = window.matchMedia && window.matchMedia('print');
    const onChange = (e) => (e.matches ? onBeforePrint() : onAfterPrint());
    if (mql && typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
    } else if (mql && typeof mql.addListener === 'function') {
      mql.addListener(onChange);
    }

    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
      if (mql && typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', onChange);
      } else if (mql && typeof mql.removeListener === 'function') {
        mql.removeListener(onChange);
      }
    };
  }, []);

  const handleDownloadPdf = () => {
    requestAnimationFrame(() => {
      window.print();
    });
  };

  return (
    <div ref={containerRef} className="print-container max-w-7xl mx-auto py-5 space-y-6">
      <style>{`
        /* Recharts a veces recorta labels que salen fuera del SVG */
        .allow-overflow .recharts-wrapper { overflow: visible !important; }
        .allow-overflow .recharts-surface { overflow: visible !important; }

        /* Mejores colores de texto para PDF */
        @media print {
          .print-container { background: #fff !important; color: #111827 !important; }
          .print-container * {
            box-shadow: none !important;
            filter: none !important;
            -webkit-filter: none !important;
            backdrop-filter: none !important;
          }
          /* Evita que items se corten entre páginas */
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          /* Quita bordes redondeados si quieres look "documento" */
          .rounded, .rounded-sm, .rounded-md, .rounded-lg, .rounded-xl, .rounded-2xl, .rounded-3xl { border-radius: 0 !important; }
          /* Forzar alto fijo típico de gráficos para consistencia */
          .chart-h-220 { height: 220px !important; }
          .chart-h-240 { height: 240px !important; }
          /* Esconde los controles solo de pantalla */
          .print\\:hidden { display: none !important; }
          /* Muestra variantes solo para print si las tuvieras */
          .print\\:block { display: block !important; }
          /* Margen de página del PDF */
          @page { margin: 16mm; }
        }
      `}</style>

      <div className="flex items-center justify-between gap-4 print:hidden">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Plan de negocios</h2>
        <div className="flex space-x-5">
          {!state && (
            <Button variant="wizard" className="flex py-2" onClick={handleCreateBusinessPlan}>
              <span>
                <FileText className="mr-2" />
              </span>
              <span>Generar plan de negocios</span>
            </Button>
          )}
          {state && showDownloadPDF && (
            <Button variant="wizard" className="flex py-2" onClick={handleDownloadPdf}>
              <span>
                <Printer className="mr-2" />
              </span>
              <span>Imprimir / PDF</span>
            </Button>
          )}
        </div>
      </div>

      <div className="avoid-break">
        <BusinessPlanView data={state} printMode={printMode} />
      </div>
    </div>
  );
}
