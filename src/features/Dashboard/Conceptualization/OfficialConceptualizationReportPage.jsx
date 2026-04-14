import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { privateService } from '../../../services/privateService';
import MarketAnalysis from './MarketAnalysis';
import BusinessPlanView from './BusinessPlanView';

function parseJson(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function OfficialConceptualizationReportPage() {
  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get('id'));
  const [conceptualization, setConceptualization] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    window.__REPORT_READY__ = false;
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    privateService
      .get(`/conceptualization/${id}/owned-detail`)
      .then((response) => {
        if (!cancelled) setConceptualization(response?.conceptualization || null);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.error || err?.message || 'No se pudo cargar la conceptualización');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const marketAnalysis = useMemo(
    () => parseJson(conceptualization?.market_analysis_raw_result),
    [conceptualization]
  );

  const businessPlan = useMemo(
    () => parseJson(conceptualization?.business_plan_raw_result),
    [conceptualization]
  );

  const generatedAt = useMemo(() => {
    const date =
      conceptualization?.updated_at ||
      conceptualization?.conceptualization_created_at ||
      conceptualization?.created_at;
    if (!date) return null;
    try {
      return new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(new Date(date));
    } catch {
      return date;
    }
  }, [conceptualization]);

  useEffect(() => {
    if (!conceptualization || !marketAnalysis) return;
    const timer = window.setTimeout(() => {
      window.__REPORT_READY__ = true;
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [conceptualization, marketAnalysis, businessPlan]);

  if (!id) {
    return <div className="p-8 text-black">Falta el parámetro id de la conceptualización.</div>;
  }

  if (error) {
    return <div className="p-8 text-black">{error}</div>;
  }

  if (!conceptualization) {
    return <div className="p-8 text-black">Cargando conceptualización oficial...</div>;
  }

  return (
    <div className="bg-white min-h-screen text-black">
      <style>{`
        .allow-overflow .recharts-wrapper { overflow: visible !important; }
        .print-container .recharts-surface text { fill: #000000 !important; }
        html:has(.print-container) { scroll-behavior: smooth; }
        .section-anchor { scroll-margin-top: 96px; }
        @page { margin: 16mm; }
        @media print {
          html, body { height: auto !important; overflow: visible !important; }
          .print-container { background: #fff !important; color: #000 !important; }
          .print-container * {
            color: #000 !important;
            box-shadow: none !important;
            filter: none !important;
            -webkit-filter: none !important;
            backdrop-filter: none !important;
            background: transparent !important;
          }
          .card-white { background: #ffffff !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          .print\\:break-after-page { break-after: page; page-break-after: always; }
          .rounded-3xl, .rounded-2xl, .rounded-xl, .rounded-lg { border-radius: 0 !important; }
          .ring-1 { box-shadow: none !important; }
        }
      `}</style>
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <header className="border-b pb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">EmpowerMe</p>
          <h1 className="text-3xl font-bold mt-2">Reporte oficial de conceptualización</h1>
          <div className="mt-4 text-sm text-gray-700 space-y-1">
            <p>
              <strong>Idea:</strong> {conceptualization?.about || '—'}
            </p>
            <p>
              <strong>Fecha:</strong> {generatedAt || '—'}
            </p>
          </div>
        </header>

        <section>
          {marketAnalysis ? (
            <MarketAnalysis data={marketAnalysis} showDownloadPDF={false} />
          ) : (
            <p>No hay análisis de viabilidad disponible para esta conceptualización.</p>
          )}
        </section>

        <section className="pt-8 border-t">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Plan de negocios</h2>
          </div>
          {businessPlan ? (
            <BusinessPlanView data={businessPlan} />
          ) : (
            <p>No hay plan de negocios disponible para esta conceptualización.</p>
          )}
        </section>
      </div>
    </div>
  );
}
