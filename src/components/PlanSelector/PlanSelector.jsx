import { useMemo, useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { formatAmount } from '../../utils/utils';

function truncateText(text, maxChars) {
  if (!text) return '';
  const clean = String(text).trim();
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, maxChars).trimEnd()}…`;
}

export default function PlanSelector({
  plans,
  showInclude = true,
  collapsedDescriptionChars = 80,
}) {
  const [openPlanKey, setOpenPlanKey] = useState(null);

  const getKey = useMemo(() => {
    return (plan, index) =>
      plan?.id ?? plan?.code ?? plan?.price_id ?? plan?.stripe_price_id ?? index;
  }, []);

  const toggle = (key) => {
    setOpenPlanKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex flex-wrap justify-center gap-6 py-10">
      {plans.map((plan, index) => {
        const key = getKey(plan, index);
        const isOpen = openPlanKey === key;
        const includeList = plan?.includes || plan?.include || [];
        const descriptionCollapsed = truncateText(plan?.description, collapsedDescriptionChars);
        const descriptionWasCollapsed = plan?.description.length > collapsedDescriptionChars;
        return (
          <div
            key={key}
            className="relative bg-white rounded-2xl shadow-lg w-60 flex flex-col items-center text-center overflow-hidden">
            {(plan.discountLabel || plan.discountPercentage) && (
              <div className="absolute top-0 right-0 bg-orange-strong text-white text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
                {plan.discountLabel || `${plan.discountPercentage}% de descuento`}
              </div>
            )}

            <div className="w-full px-4 pt-10">
              <h2 className="text-md font-bold mb-2">{plan.name}</h2>

              <p className="text-black text-xs">
                {isOpen ? plan?.description : descriptionCollapsed}
              </p>

              {isOpen && (
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-semibold text-primary hover:text-purple-700 transition">
                  <span>Ver menos</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
            </div>

            <p className="text-4xl font-semibold text-black my-4">
              {formatAmount(plan.amount_cents, plan.currency)}
            </p>

            <div
              className={`w-full overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
              {showInclude && includeList?.length > 0 && (
                <>
                  <h3 className="text-xs mb-2 bg-primary-opaque w-full py-1">Incluye:</h3>
                  <ul className="text-xs space-y-2 mb-4 px-4 w-full">
                    {includeList.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-orange-strong" />
                        <span className="text-left">{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {isOpen && plan?.generalInfo && (
                <div className="mx-4 mb-4 rounded-xl border border-purple-200 bg-purple-50 p-4 text-xs text-gray-800 text-left">
                  <p>{plan.generalInfo}</p>
                </div>
              )}
            </div>

            <div className="w-full px-4">
              {descriptionWasCollapsed && !isOpen && (
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className="flex items-center justify-center gap-2 border-primary border text-primary mb-3 hover:text-purple-700 transition rounded-full py-2 px-6 cursor-pointer w-full">
                  <Plus className="w-4 h-4" />
                  <span>{'Saber más'}</span>
                </button>
              )}

              <button
                onClick={plan?.onClick}
                className="bg-primary text-white rounded-full py-2 px-6 hover:bg-purple-700 transition mb-6 cursor-pointer w-full">
                Comprar Ahora
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
