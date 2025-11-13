import { Check } from 'lucide-react';
import { formatAmount } from '../../utils/utils';

export default function PlanSelector({ plans }) {
  return (
    <div className="flex flex-wrap justify-center gap-6 py-10">
      {plans.map((plan, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-lg w-60 flex flex-col items-center text-center">
          <h2 className="text-md font-bold mb-2 mt-6">{plan.name}</h2>
          <p className="text-black mb-4 text-xs mx-1">{plan.description}</p>
          <p className="text-4xl font-semibold text-black mb-4">
            {formatAmount(plan.amount_cents, plan.currency)}
          </p>
          {plan?.include && (
            <h3 className="text-xs mb-2 bg-primary-opaque w-full py-1">Incluye:</h3>
          )}
          <ul className="text-xs space-y-2 mb-6">
            {plan?.include?.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-orange-strong" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={plan?.onClick}
            className="bg-primary text-white rounded-full py-2 px-6 hover:bg-purple-700 transition mb-6">
            Comprar Ahora
          </button>
        </div>
      ))}
    </div>
  );
}
