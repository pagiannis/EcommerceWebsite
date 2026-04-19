interface QuantityStepperProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
}

export default function QuantityStepper({ value, onChange, min = 1 }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-brand-gray px-4 py-2">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="text-lg font-medium disabled:opacity-30"
      >
        −
      </button>
      <span className="min-w-[1.5rem] text-center text-sm font-medium">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="text-lg font-medium"
      >
        +
      </button>
    </div>
  );
}
