interface QuantityStepperProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  disabled?: boolean;
}

export default function QuantityStepper({ value, onChange, min = 1, disabled = false }: QuantityStepperProps) {
  return (
    <div className={`flex items-center gap-3 rounded-full bg-brand-gray px-4 py-2 ${disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        className="text-lg font-medium disabled:opacity-30"
      >
        −
      </button>
      <span className="min-w-[1.5rem] text-center text-sm font-medium">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        className="text-lg font-medium disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
