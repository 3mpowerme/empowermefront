// PlanNegociosView.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
} from 'recharts';
import { Check, Target, TrendingUp, DollarSign, Users } from 'lucide-react';
import CardSection from '../../../components/CardSection/CardSection';
import Button from '../../../components/Button/Button';

const fmtMoneda = (n, locale, currency) =>
  typeof n === 'number'
    ? new Intl.NumberFormat(locale || 'es-CL', {
        style: 'currency',
        currency: currency || 'CLP',
        maximumFractionDigits: 0,
      }).format(n)
    : n;

function toViewModel(json) {
  console.log('json', json);
  console.log('typeof json', typeof json);
  const newJson = typeof json === 'string' ? JSON.parse(json) : json;
  if (!newJson || typeof newJson !== 'object') throw new Error('Datos inválidos');
  const {
    meta_moneda,
    resumen_ejecutivo,
    descripcion_negocio,
    analisis_mercado,
    plan_financiero,
    veredicto,
  } = newJson;

  return {
    moneda: meta_moneda,
    resumen: resumen_ejecutivo,
    descripcion: descripcion_negocio,
    mercado: analisis_mercado,
    finanzas: plan_financiero,
    veredicto,
  };
}

export default function PlanNegociosView({ data }) {
  const vm = useMemo(() => toViewModel(data), [data]);
  const { moneda, resumen, descripcion, mercado, finanzas, veredicto } = vm;

  return (
    <div className="flex flex-col gap-6 w-full">
      <CardSection title="Resumen Ejecutivo" icon={<Target />}>
        <h2 className="text-lg font-semibold">{resumen.vision_clara}</h2>
        <p className="text-sm opacity-80 mt-2">{resumen.propuesta_valor}</p>
        <ul className="list-disc pl-5 mt-3 text-sm">
          {resumen.puntos_clave.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <p className="mt-3 italic text-sm">{resumen.objetivo_general}</p>
      </CardSection>

      <CardSection title="Descripción del Negocio" icon={<Users />}>
        <p className="text-sm">{descripcion.mision}</p>
        <p className="text-sm mt-2">{descripcion.vision}</p>
        <h4 className="font-medium mt-3">Objetivos:</h4>
        <ul className="list-disc pl-5 text-sm">
          {descripcion.objetivos.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
        <p className="text-sm mt-2">
          <strong>Estructura Legal:</strong> {descripcion.estructura_legal}
        </p>
        <p className="text-sm mt-1">
          <strong>Ubicación:</strong> {descripcion.ubicacion}
        </p>
      </CardSection>

      <CardSection title="Análisis de Mercado" icon={<TrendingUp />}>
        <h4 className="font-semibold mb-2">Segmentos de Clientes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mercado.segmentos_clientes.map((seg, i) => (
            <div key={i} className="border rounded-xl p-3">
              <h5 className="font-medium">{seg.nombre}</h5>
              <p className="text-xs opacity-80 mb-1">{seg.perfil}</p>
              <div className="text-xs">
                <strong>Necesidades:</strong>
                <ul className="list-disc pl-4">
                  {seg.necesidades.map((n, j) => (
                    <li key={j}>{n}</li>
                  ))}
                </ul>
              </div>
              <div className="text-xs mt-2">
                <strong>Dolores:</strong>
                <ul className="list-disc pl-4">
                  {seg.dolores.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              </div>
              <div className="text-xs mt-2">
                <strong>Disposición a pagar:</strong>{' '}
                {fmtMoneda(seg.disposicion_pagar.rango.min, moneda.locale, moneda.currency)} -{' '}
                {fmtMoneda(seg.disposicion_pagar.rango.max, moneda.locale, moneda.currency)} (
                {seg.disposicion_pagar.sensibilidad_precio})
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h4 className="font-medium">Competencia Directa</h4>
          {mercado.competencia.directa.map((c, i) => (
            <div key={i} className="text-sm border-b py-2">
              <strong>{c.nombre}</strong> – {c.propuesta}
              <p className="text-xs opacity-70">Precio: {c.precio_relativo}</p>
            </div>
          ))}
        </div>
      </CardSection>

      <CardSection title="Plan Financiero" icon={<DollarSign />}>
        <h4 className="font-semibold mb-2">Inversión Inicial</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2 border">Concepto</th>
                <th className="p-2 border">Monto</th>
              </tr>
            </thead>
            <tbody>
              {finanzas.inversion_inicial.rubro.map((r, i) => (
                <tr key={i}>
                  <td className="p-2 border">{r.concepto}</td>
                  <td className="p-2 border text-right">
                    {fmtMoneda(r.amount, moneda.locale, moneda.currency)}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-50">
                <td className="p-2 border">Total</td>
                <td className="p-2 border text-right">
                  {fmtMoneda(finanzas.inversion_inicial.total, moneda.locale, moneda.currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-1">Costos Fijos Mensuales</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={finanzas.costos_fijos_mensuales.map((c) => ({
                name: c.concepto,
                value: c.amount,
              }))}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => fmtMoneda(v, moneda.locale, moneda.currency)} />
              <ReTooltip formatter={(v) => fmtMoneda(v, moneda.locale, moneda.currency)} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardSection>

      <CardSection title="Conclusión / Veredicto" icon={<Check />}>
        <p className="text-base font-medium">
          Nivel: <span className="font-semibold">{veredicto.nivel}</span>
        </p>
        <p className="text-sm mt-2">{veredicto.conclusion}</p>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-1">Razones Clave</h4>
            <ul className="list-disc pl-5 text-sm">
              {veredicto.razones_clave.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Condiciones para el Éxito</h4>
            <ul className="list-disc pl-5 text-sm">
              {veredicto.condiciones_para_exito.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardSection>
    </div>
  );
}
