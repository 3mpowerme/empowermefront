export default function NumberInput({ value, onChange, min = 0, max = 9999, step = 1 }) {
  return (
    <div className="flex items-center gap-1 w-full">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, Number(value) - step))}
        className="px-2 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition text-neutral-700 text-sm font-medium cursor-pointer">
        -
      </button>

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full text-center border border-neutral-300 rounded-xl px-4 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
      />

      <button
        type="button"
        onClick={() => onChange(Math.min(max, Number(value) + step))}
        className="px-2 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition text-neutral-700 text-sm font-medium cursor-pointer">
        +
      </button>
    </div>
  );
}
