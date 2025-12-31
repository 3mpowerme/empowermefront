import React, { useCallback, useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CardSection from '../../../components/CardSection/CardSection';
import { FileText, HandCoins, Image as ImageIcon, Info, MapPin, Printer } from 'lucide-react';
import { getIconByOfferingServiceType } from '../../../utils/catalogs';
import Button from '../../../components/Button/Button';
import { deriveFilenameFromUrl, downloadImageFromUrl } from '../../../utils/utils';
import ImageModal from '../../../components/Modal/ImageModal';

export default function BrandBook({
  brandName = '',
  slogan = '',
  logoUrl = '',
  businessSector = '',
  offeringServiceType = '',
  about = '',
  region = '',
  colorimetry = [],
  colorimetryName,
  showPrintPdf = false,
}) {
  const containerRef = useRef(null);
  const [downloadingLogo, setDownloadingLogo] = useState(false);
  const [modalUrl, setModalUrl] = useState(null);
  const showDownloadButton = false;

  const openModal = useCallback((url) => {
    if (url) setModalUrl(url);
  }, []);
  const closeModal = useCallback(() => setModalUrl(null), []);

  const forceResize = () => {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  };

  useEffect(() => {
    const onBeforePrint = () => {
      if (containerRef.current) {
        containerRef.current.classList.add('allow-overflow');
      }
      forceResize();
    };
    const onAfterPrint = () => {
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

  const handleDownloadLogo = async () => {
    if (!logoUrl) return;
    setDownloadingLogo(true);
    const fileName =
      (brandName ? `${brandName}_logo` : 'logo') +
      '.' +
      (deriveFilenameFromUrl(logoUrl).split('.').pop() || 'png');
    await downloadImageFromUrl(logoUrl, fileName.replace(/[^\w\d-_\.]+/g, '_'));
    setDownloadingLogo(false);
  };

  const handlePrintBrowserPdf = () => {
    requestAnimationFrame(() => window.print());
  };

  const OfferingServiceTypeIcon = getIconByOfferingServiceType(offeringServiceType);

  return (
    <div className="max-w-7xl mx-auto py-5 space-y-6 print-container">
      <style>{`
        /* Si luego agregas Recharts, esto evita que corte etiquetas fuera del SVG */
        .allow-overflow .recharts-wrapper { overflow: visible !important; }
        .allow-overflow .recharts-surface { overflow: visible !important; }

        @media print {
          .print-container { background: #fff !important; color: #111827 !important; }
          .print-container * {
            box-shadow: none !important;
            filter: none !important;
            -webkit-filter: none !important;
            backdrop-filter: none !important;
          }
          /* Evita cortes de bloques entre páginas */
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          /* Quitar bordes redondeados para look de documento */
          .rounded, .rounded-sm, .rounded-md, .rounded-lg, .rounded-xl, .rounded-2xl, .rounded-3xl { border-radius: 0 !important; }
          /* Controles solo de pantalla */
          .print\\:hidden { display: none !important; }
          /* Margen de página */
          @page { margin: 16mm; }
        }
      `}</style>

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Brand Book</h2>
        {showPrintPdf && (
          <div className="flex gap-3">
            <Button
              variant="wizard"
              className="flex py-2 print:hidden"
              onClick={handlePrintBrowserPdf}>
              <span>
                <Printer className="mr-2" />
              </span>
              <span>Imprimir PDF</span>
            </Button>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="space-y-6 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 avoid-break">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSection title="Nombre de la marca" className="md:col-span-1">
            {brandName?.trim() ? (
              <p className="text-xl font-semibold text-gray-900 break-words">{brandName}</p>
            ) : (
              <p className="text-sm text-gray-500">No brand name provided.</p>
            )}
          </CardSection>

          <CardSection title="Slogan" className="md:col-span-2">
            {slogan?.trim() ? (
              <p className="text-base text-gray-800 break-words">“{slogan}”</p>
            ) : (
              <p className="text-sm text-gray-500">No slogan provided.</p>
            )}
          </CardSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSection title="Logo" className="lg:col-span-1">
            {logoUrl?.trim() ? (
              <div className="aspect-square w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50 flex flex-col items-center justify-center p-4">
                <img
                  src={logoUrl}
                  alt="Brand logo"
                  className="max-h-full max-w-full object-contain"
                />
                <div className="mb-4 flex gap-2">
                  <Button variant="wizard" className="flex py-2" onClick={() => openModal(logoUrl)}>
                    <span>
                      <ImageIcon size={20} />
                    </span>
                    <span> Ver</span>
                  </Button>
                  {showDownloadButton && (
                    <Button
                      variant="wizard"
                      className="flex py-2"
                      onClick={handleDownloadLogo}
                      disabled={!logoUrl || downloadingLogo}>
                      <span>
                        <FileText size={20} className="mr-1" />
                      </span>
                      <span>{downloadingLogo ? 'Descargando…' : 'Descargar'}</span>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-square w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                <span className="text-sm text-gray-500">No logo image</span>
              </div>
            )}
          </CardSection>

          <CardSection title="Colorimetría" className="lg:col-span-2">
            {colorimetryName ? <p className="text-md text-black mb-5">{colorimetryName}</p> : null}
            {Array.isArray(colorimetry) && colorimetry.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {colorimetry.map((hex, idx) => (
                  <div key={`${hex}-${idx}`} className="flex flex-col items-center gap-2">
                    <div
                      className="w-16 h-16 rounded-xl border border-gray-200"
                      style={{ backgroundColor: hex }}
                      aria-label={`Color swatch ${hex}`}
                      title={hex}
                    />
                    <code className="text-xs text-gray-700">{hex}</code>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No color palette defined.</p>
            )}
          </CardSection>

          <CardSection title="Descripción del negocio" className="lg:col-span-3">
            <div className="mb-5">
              <MapPin size={20} className="mr-2 inline text-primary" />
              <span>{region}</span>
            </div>
            <div className="mb-5">
              <HandCoins size={20} className="mr-2 inline text-primary" />
              <span>Sector: </span>
              <span>{businessSector}</span>
            </div>
            <div className="mb-5">
              {/** Ícono dinámico según el tipo de servicio */}
              {OfferingServiceTypeIcon ? (
                <OfferingServiceTypeIcon size={20} className="mr-2 inline text-primary" />
              ) : null}
              <span>Tipo de servicio: </span>
              <span>{offeringServiceType}</span>
            </div>
            <div className="mb-5">
              <Info size={20} className="mr-2 inline text-primary" />
              <span>Acerca del negocio: </span>
              <span>{about}</span>
            </div>
          </CardSection>
        </div>
      </div>

      <ImageModal isOpen={!!modalUrl} url={modalUrl} onClose={closeModal} />
    </div>
  );
}
