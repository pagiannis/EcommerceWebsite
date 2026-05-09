import type { ComponentPropsWithoutRef } from "react";

interface Props extends ComponentPropsWithoutRef<"input"> {
  label: string;
  error?: string;
  hint?: string;
}

export default function FormField({ label, error, hint, ...inputProps }: Props) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {hint && <span className="font-normal text-gray-400"> {hint}</span>}
      </label>
      <input
        {...inputProps}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-black"
      />
      {error && <p className="mt-1 text-xs text-brand-red">{error}</p>}
    </div>
  );
}
