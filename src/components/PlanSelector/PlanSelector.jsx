import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { formatAmount } from '../../utils/utils';

export default function PlanSelector({ plans, showInclude = true }) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-6 py-10">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="relative bg-white rounded-2xl shadow-lg w-60 flex flex-col items-center text-center overflow-hidden">
            {(plan.discountLabel || plan.discountPercentage) && (
              <div className="absolute top-0 right-0 bg-orange-strong text-white text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
                {plan.discountLabel || `${plan.discountPercentage}% de descuento`}
              </div>
            )}
            <h2 className="text-md font-bold mb-2 mt-10">{plan.name}</h2>
            <p className="text-black mb-4 text-xs mx-1">{plan.description}</p>
            <p className="text-4xl font-semibold text-black mb-4">
              {formatAmount(plan.amount_cents, plan.currency)}
            </p>
            {showInclude && (
              <>
                {plan?.include && (
                  <h3 className="text-xs mb-2 bg-primary-opaque w-full py-1">Incluye:</h3>
                )}
                <ul className="text-xs space-y-2 mb-4 px-4 w-full">
                  {plan?.include?.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-orange-strong" />
                      <span className="text-left">{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button
              type="button"
              onClick={() => setSelectedPlan(plan)}
              className="flex items-center gap-2 border-primary border text-primary mb-5 hover:text-purple-700 transition rounded-full py-2 px-6 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Saber más</span>
            </button>
            <button
              onClick={plan?.onClick}
              className="bg-primary text-white rounded-full py-2 px-6 hover:bg-purple-700 transition mb-6 cursor-pointer">
              Comprar Ahora
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold">{selectedPlan.name}</h2>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedPlan.description && (
              <p className="text-sm text-gray-700 mb-4">{selectedPlan.description}</p>
            )}

            {selectedPlan.include && selectedPlan.include.length > 0 && (
              <>
                <h3 className="text-xs font-semibold mb-2">Incluye:</h3>
                <ul className="text-xs space-y-2 mb-4">
                  {selectedPlan.include.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-strong" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-2 rounded-xl border border-purple-200 bg-purple-50 p-4 text-xs text-gray-800">
              <p>{selectedPlan.generalInfo || selectedPlan.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
