// PlanNegociosView.jsx
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  LabelList,
} from 'recharts';
import {
  Check,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  UtensilsCrossed,
  Megaphone,
  ClipboardList,
  CalendarRange,
  Activity,
} from 'lucide-react';
import CardSection from '../../../components/CardSection/CardSection';

const getCurrencyFormatter = (meta) => {
  const locale = meta?.locale || 'es-CL';
  const currency = meta?.currency || 'CLP';
  try {
    return (n, options) =>
      typeof n === 'number'
        ? new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
            ...options,
          }).format(n)
        : n;
  } catch {
    return (n) =>
      typeof n === 'number' ? `${currency} ${Math.round(n).toLocaleString(locale)}` : n;
  }
};

const getCompactNumberFormatter = (meta) => {
  const locale = meta?.locale || 'es-CL';
  try {
    return (n) =>
      typeof n === 'number'
        ? new Intl.NumberFormat(locale, {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 1,
          }).format(n)
        : n;
  } catch {
    return (n) => n;
  }
};

const getPercentFormatter = (meta) => {
  const locale = meta?.locale || 'es-CL';
  return (n) => {
    if (typeof n !== 'number') return '—';
    const isRatio = n <= 1;
    const value = isRatio ? n * 100 : n;
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)}%`;
  };
};

function toViewModel(json) {
  const newJson = typeof json === 'string' ? JSON.parse(json) : json;
  if (!newJson || typeof newJson !== 'object') throw new Error('Datos inválidos');
  const base = newJson.business_plan || newJson;
  const {
    meta_moneda,
    resumen_ejecutivo,
    descripcion_negocio,
    analisis_mercado,
    producto_servicio,
    marketing_ventas,
    plan_operativo,
    estructura_organizacional,
    plan_financiero,
    plan_implementacion,
    veredicto,
  } = base;

  return {
    moneda: meta_moneda,
    resumen: resumen_ejecutivo,
    descripcion: descripcion_negocio,
    mercado: analisis_mercado,
    producto: producto_servicio,
    marketing: marketing_ventas,
    operativo: plan_operativo,
    organizacion: estructura_organizacional,
    finanzas: plan_financiero,
    implementacion: plan_implementacion,
    veredicto,
  };
}

const BarValueLabel = (props) => {
  const { x, y, width, value, fmtCurrency } = props;
  if (value == null || isNaN(value)) return null;
  const centerX = x + width / 2;
  const desiredY = y - 4;
  const clampedY = desiredY < 12 ? 12 : desiredY;
  return (
    <text
      x={centerX}
      y={clampedY}
      textAnchor="middle"
      fontSize={12}
      fill="#000000"
      fontWeight={500}>
      {fmtCurrency(Number(value))}
    </text>
  );
};

export default function PlanNegociosView({ data }) {
  const vm = useMemo(() => toViewModel(data), [data]);
  const {
    moneda,
    resumen,
    descripcion,
    mercado,
    producto,
    marketing,
    operativo,
    organizacion,
    finanzas,
    implementacion,
    veredicto,
  } = vm;

  const fmtCurrency = useMemo(() => getCurrencyFormatter(moneda), [moneda]);
  const fmtCompact = useMemo(() => getCompactNumberFormatter(moneda), [moneda]);
  const fmtPercent = useMemo(() => getPercentFormatter(moneda), [moneda]);

  const costosFijosChartData = useMemo(
    () =>
      (finanzas.costos_fijos_mensuales || []).map((c) => ({
        name: c.concepto,
        value: c.amount,
      })),
    [finanzas.costos_fijos_mensuales]
  );

  const burnRateChartData = useMemo(
    () =>
      (finanzas.escenarios_burn_rate_mensual || []).map((s) => ({
        name: s.nombre,
        value: s.gastos_mensuales,
      })),
    [finanzas.escenarios_burn_rate_mensual]
  );

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
        {descripcion.historia && (
          <p className="text-sm mt-2">
            <strong>Historia:</strong> {descripcion.historia}
          </p>
        )}
      </CardSection>

      <CardSection title="Análisis de Mercado" icon={<TrendingUp />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="border rounded-xl p-3 text-sm">
            <div className="font-semibold mb-1">Tamaño de mercado</div>
            <div className="text-xs">
              Método: <span className="font-medium">{mercado.tamano.metodo}</span>
            </div>
            <div className="text-xs mt-1">
              Estimación clientes:{' '}
              <span className="font-medium">
                {fmtCompact(mercado.tamano.estimacion_clientes.min)} –{' '}
                {fmtCompact(mercado.tamano.estimacion_clientes.max)}
              </span>
            </div>
          </div>
          <div className="border rounded-xl p-3 text-sm">
            <div className="font-semibold mb-1">Oportunidades de mercado</div>
            <ul className="list-disc pl-4 text-xs">
              {(mercado.oportunidades || []).map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
          <div className="border rounded-xl p-3 text-sm">
            <div className="font-semibold mb-1">Barreras de entrada</div>
            <ul className="list-disc pl-4 text-xs">
              {(mercado.competencia.barreras_entrada || []).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        </div>

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
                <strong>Disposición a pagar:</strong> {fmtCurrency(seg.disposicion_pagar.rango.min)}{' '}
                - {fmtCurrency(seg.disposicion_pagar.rango.max)} (
                {seg.disposicion_pagar.sensibilidad_precio})
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-1">Competencia Directa</h4>
            {mercado.competencia.directa.map((c, i) => (
              <div key={i} className="text-sm border-b py-2">
                <strong>{c.nombre}</strong> – {c.propuesta}
                <p className="text-xs opacity-70">Precio: {c.precio_relativo}</p>
                <p className="text-xs mt-1">
                  <strong>Fortalezas:</strong> {c.fortalezas.join(', ')}
                </p>
                <p className="text-xs">
                  <strong>Debilidades:</strong> {c.debilidades.join(', ')}
                </p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-medium mb-1">Competencia Indirecta</h4>
            {(mercado.competencia.indirecta || []).map((c, i) => (
              <div key={i} className="text-sm border-b py-2">
                <strong>{c.tipo}</strong> como sustituto de {c.sustituto_de}
                <p className="text-xs opacity-70">Riesgo: {c.riesgo}</p>
              </div>
            ))}
          </div>
        </div>
      </CardSection>

      <CardSection title="Producto y Servicio" icon={<UtensilsCrossed />}>
        <p className="text-sm">{producto.oferta}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
          <div>
            <h4 className="font-medium mb-1">Beneficios</h4>
            <ul className="list-disc pl-5 text-xs">
              {producto.beneficios.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Diferenciadores</h4>
            <ul className="list-disc pl-5 text-xs">
              {producto.diferenciadores.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Roadmap</h4>
            <ul className="list-disc pl-5 text-xs">
              {producto.roadmap.map((r, i) => (
                <li key={i}>
                  <span className="font-medium">{r.nombre}:</span> {r.descripcion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardSection>

      <CardSection title="Marketing y Ventas" icon={<Megaphone />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="border rounded-xl p-3">
            <h4 className="font-medium mb-1">Precios</h4>
            <p className="text-xs">
              Precio promedio:{' '}
              <span className="font-semibold">
                {fmtCurrency(marketing.precios.precio_promedio)}
              </span>
            </p>
            <p className="text-xs mt-1">{marketing.precios.estrategia_precio}</p>
          </div>
          <div className="border rounded-xl p-3">
            <h4 className="font-medium mb-1">Canales</h4>
            <ul className="list-disc pl-5 text-xs">
              {marketing.canales.map((c, i) => (
                <li key={i}>
                  <span className="font-semibold">{c.tipo}:</span> {c.descripcion}
                </li>
              ))}
            </ul>
          </div>
          <div className="border rounded-xl p-3">
            <h4 className="font-medium mb-1">Promoción</h4>
            <ul className="list-disc pl-5 text-xs">
              {marketing.promocion.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-sm mt-3">
          <strong>Posicionamiento:</strong> {marketing.posicionamiento}
        </p>
      </CardSection>

      <CardSection title="Plan Operativo" icon={<ClipboardList />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Procesos clave</h4>
            <ul className="list-disc pl-5 text-xs">
              {operativo.procesos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Recursos</h4>
            <p className="text-xs">
              <strong>Infraestructura:</strong> {operativo.recursos.infraestructura}
            </p>
            <p className="text-xs mt-1">
              <strong>Equipamiento:</strong> {operativo.recursos.equipamiento}
            </p>
            <p className="text-xs mt-1">
              <strong>Proveedores clave:</strong> {operativo.recursos.proveedores_clave.join(', ')}
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Tecnología y logística</h4>
            <p className="text-xs">
              <strong>Tecnología:</strong> {operativo.tecnologia}
            </p>
            <p className="text-xs mt-1">
              <strong>Logística:</strong> {operativo.logistica}
            </p>
          </div>
        </div>
      </CardSection>

      <CardSection title="Estructura Organizacional" icon={<Users />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Roles</h4>
            <ul className="list-disc pl-5 text-xs">
              {organizacion.roles.map((r, i) => (
                <li key={i}>
                  <span className="font-semibold">{r.rol}:</span> {r.responsabilidades.join(', ')}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Equipo fundador</h4>
            <ul className="list-disc pl-5 text-xs">
              {organizacion.equipo_fundador.map((e, i) => (
                <li key={i}>
                  <span className="font-semibold">
                    {e.nombre} ({e.rol})
                  </span>
                  {' – '}
                  {e.experiencia}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Personal clave</h4>
            <ul className="list-disc pl-5 text-xs">
              {organizacion.personal_clave.map((p, i) => (
                <li key={i}>
                  <span className="font-semibold">
                    {p.nombre} ({p.rol})
                  </span>
                  {' – '}
                  {p.experiencia}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardSection>

      <CardSection title="Plan Financiero" icon={<DollarSign />}>
        <h4 className="font-semibold mb-2">Inversión Inicial</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2 border">Concepto</th>
                <th className="p-2 border">Monto ({moneda?.currency})</th>
              </tr>
            </thead>
            <tbody>
              {finanzas.inversion_inicial.rubro.map((r, i) => (
                <tr key={i}>
                  <td className="p-2 border">{r.concepto}</td>
                  <td className="p-2 border text-right">{fmtCurrency(r.amount)}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-50">
                <td className="p-2 border">Total</td>
                <td className="p-2 border text-right">
                  {fmtCurrency(finanzas.inversion_inicial.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="border rounded-xl p-3">
            <h4 className="font-medium mb-1">Precio y volumen</h4>
            <p className="text-xs">
              Precio promedio:{' '}
              <span className="font-semibold">{fmtCurrency(finanzas.precio_promedio)}</span>
            </p>
            <p className="text-xs mt-1">
              Volumen mensual estimado:{' '}
              <span className="font-semibold">
                {finanzas.volumen_mensual_estimado.min} – {finanzas.volumen_mensual_estimado.max}{' '}
                unidades
              </span>
            </p>
          </div>
          <div className="border rounded-xl p-3">
            <h4 className="font-medium mb-1">Punto de equilibrio</h4>
            <p className="text-xs">
              Unidades: <span className="font-semibold">{finanzas.punto_equilibrio.unidades}</span>
            </p>
            <p className="text-xs mt-1">
              Ventas:{' '}
              <span className="font-semibold">{fmtCurrency(finanzas.punto_equilibrio.ventas)}</span>
            </p>
            <p className="text-xs mt-1 opacity-80">{finanzas.punto_equilibrio.formula}</p>
          </div>
          <div className="border rounded-xl p-3">
            <h4 className="font-medium mb-1">Margen y ROI</h4>
            <p className="text-xs">
              Margen bruto:{' '}
              <span className="font-semibold">
                {fmtPercent(finanzas.margen_esperado['bruto_%'])}
              </span>
            </p>
            <p className="text-xs mt-1">
              Margen operativo:{' '}
              <span className="font-semibold">
                {fmtPercent(finanzas.margen_esperado['operativo_%'])}
              </span>
            </p>
            <p className="text-xs mt-1">
              ROI anual estimado:{' '}
              <span className="font-semibold">{fmtPercent(finanzas['roi_anual_estimado_%'])}</span>
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-1">Costos Fijos Mensuales</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={costosFijosChartData}
                  margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => fmtCompact(Number(v))} tick={{ fontSize: 12 }} />
                  <ReTooltip formatter={(v) => fmtCurrency(Number(v))} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                    <LabelList
                      dataKey="value"
                      content={(props) => <BarValueLabel {...props} fmtCurrency={fmtCurrency} />}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {(finanzas.costos_fijos_mensuales || []).map((c, i) => (
                <div
                  key={i}
                  className="border rounded-xl p-3 bg-white shadow-sm flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{c.concepto}</span>
                    <span className="text-xs font-semibold">{fmtCurrency(c.amount)}</span>
                  </div>
                  <p className="text-xs opacity-80">
                    {c.descripcion_costo_fijo || 'Sin descripción'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="border rounded-xl p-3">
            <h4 className="font-medium mb-1">Costos variables</h4>
            <ul className="list-disc pl-5 text-xs">
              {(finanzas.costos_variables || []).map((c, i) => (
                <li key={i}>
                  {c.concepto}: {fmtPercent(c.porcentaje_sobre_ventas)}
                </li>
              ))}
            </ul>
          </div>
          <div className="border rounded-xl p-3">
            <h4 className="font-medium mb-1">Riesgos financieros</h4>
            <ul className="list-disc pl-5 text-xs">
              {(finanzas.riesgos_financieros || []).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="border rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <h4 className="font-medium">Capital de trabajo estimado</h4>
            </div>
            <p className="text-xs mt-1">
              Monto recomendado:{' '}
              <span className="font-semibold">
                {fmtCurrency(finanzas.capital_trabajo_estimado.monto_recomendado)}
              </span>
            </p>
            <p className="text-xs">
              Meses de cobertura:{' '}
              <span className="font-semibold">
                {finanzas.capital_trabajo_estimado.meses_cobertura}
              </span>
            </p>
            {finanzas.capital_trabajo_estimado.comentario && (
              <p className="text-xs mt-1 opacity-80">
                {finanzas.capital_trabajo_estimado.comentario}
              </p>
            )}
          </div>
          <div className="border rounded-xl p-3">
            <h4 className="font-medium mb-1">Escenarios de burn rate mensual</h4>
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={burnRateChartData}
                  margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => fmtCompact(Number(v))} tick={{ fontSize: 12 }} />
                  <ReTooltip formatter={(v) => fmtCurrency(Number(v))} />
                  <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]}>
                    <LabelList
                      dataKey="value"
                      content={(props) => <BarValueLabel {...props} fmtCurrency={fmtCurrency} />}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 text-xs space-y-1">
              {(finanzas.escenarios_burn_rate_mensual || []).map((s, i) => (
                <li key={i}>
                  <span className="font-semibold">{s.nombre}:</span> {s.descripcion} · Burn:{' '}
                  {fmtCurrency(s.gastos_mensuales)} · Meses cobertura:{' '}
                  {s.meses_cobertura_con_capital_trabajo}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardSection>

      <CardSection title="Plan de Implementación" icon={<CalendarRange />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Cronograma</h4>
            <ul className="list-disc pl-5 text-xs">
              {(implementacion.cronograma || []).map((c, i) => (
                <li key={i}>
                  <span className="font-semibold">{c.nombre}:</span> {c.descripcion} ({c.inicio} →{' '}
                  {c.fin})
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Hitos</h4>
            <ul className="list-disc pl-5 text-xs">
              {(implementacion.hitos || []).map((h, i) => (
                <li key={i}>
                  <span className="font-semibold">{h.nombre}:</span> {h.descripcion} ({h.inicio} →{' '}
                  {h.fin})
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
          <div>
            <h4 className="font-medium mb-1">Riesgos</h4>
            <ul className="list-disc pl-5 text-xs">
              {(implementacion.riesgos || []).map((r, i) => (
                <li key={i}>
                  <span className="font-semibold">{r.riesgo}:</span> Probabilidad {r.probabilidad},{' '}
                  impacto {r.impacto}. Mitigación: {r.mitigacion}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Mitigaciones generales</h4>
            <ul className="list-disc pl-5 text-xs">
              {(implementacion.mitigaciones || []).map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
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
