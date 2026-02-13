import React, { useEffect, useState, useCallback } from 'react';
import Button from '../../../components/Button/Button';
import { FileText, Loader2, Image as ImageIcon, Image } from 'lucide-react';
import { privateService } from '../../../services/privateService';
import { useApp } from '../../../hooks/useApp';
import ImageModal from '../../../components/Modal/ImageModal';
import { useSearchParams } from 'react-router';
import Tabs from '../../../components/Tabs/Tabs';
import { formatToDatetime } from '../../../utils/utils';

const LogoHistory = ({ logos }) => {
  console.log('logos', logos);
  return (
    <>
      {Array.isArray(logos) && logos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {logos.map((item, i) => (
            <LogoCard key={item.history_id} item={item} optionNumber={i + 1} />
          ))}
        </div>
      )}
    </>
  );
};

export default function Logos({
  offering_service_type_id,
  region_id,
  business_sector_id,
  about,
  conceptualization_id,
  brand_book_id,
  logos,
  handleCreateLogos = () => {},
  refetchConceptualizations = () => {},
}) {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const sub = searchParams.get('sub');

  const tabs = [
    {
      id: 'history',
      label: 'Historial',
      content: <LogoHistory logos={logos} />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-10 py-5 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Logos</h2>
        {
          <Button
            onClick={handleCreateLogos}
            variant="wizard"
            className="flex items-center gap-2 px-4 py-2"
            disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FileText />
                Generar Logo
              </>
            )}
          </Button>
        }
      </div>
      <Tabs tabs={tabs} initialTab={sub} />
    </div>
  );
}

function LogoCard({ item, optionNumber }) {
  const [modalUrl, setModalUrl] = useState(null);

  const openModal = useCallback((url) => {
    if (url) setModalUrl(url);
  }, []);
  const closeModal = useCallback(() => setModalUrl(null), []);

  const handleChooseMockup = () => {};

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Logo #{optionNumber}</div>
      </div>

      <div className="flex flex-col gap-3">
        <PreviewPane
          label={formatToDatetime(item.logo_created_at)}
          url={item.logo_url}
          onView={openModal}
        />
      </div>

      {!item?.chosen && false && (
        <div className="mt-auto">
          <button
            onClick={() => handleChooseMockup(item.history_id)}
            className="text-[11px] font-medium text-primary hover:primary cursor-pointer underline underline-offset-2">
            Elegir logo
          </button>
        </div>
      )}
      <ImageModal isOpen={!!modalUrl} url={modalUrl} onClose={closeModal} />
    </div>
  );
}

function PreviewPane({ label, url, onView }) {
  return (
    <div className="rounded-lg border border-gray-300 bg-gray-50 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-2 text-[10px] text-gray-600 px-2 py-1 border-b border-gray-200 bg-white">
        <span className="font-medium text-gray-700">{label}</span>
        <div className="ml-auto flex items-center gap-2">
          {!url && <span className="text-[10px] text-red-500">sin imagen</span>}
        </div>
      </div>
      <div className="aspect-[1.6] flex flex-col items-center justify-center text-[10px] text-gray-500 bg-gray-50">
        {url ? (
          <>
            <img src={url} alt={`${label} tarjeta`} className="w-full h-full object-cover" />
            <Button variant="wizard" className="flex py-2 mb-5" onClick={() => onView(url)}>
              <span>
                <Image size={20} />
              </span>
            </Button>
          </>
        ) : (
          <span className="flex items-center gap-1">
            <ImageIcon className="w-4 h-4" /> preview no disponible
          </span>
        )}
      </div>
    </div>
  );
}
