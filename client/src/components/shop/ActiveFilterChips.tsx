import { useSearchParams } from "react-router-dom";

const CHIP_FILTERS = [
  { key: "onSale", label: "On Sale" },
  { key: "newArrivals", label: "New Arrivals" },
  { key: "topSelling", label: "Top Selling" },
] as const;

type ChipKey = (typeof CHIP_FILTERS)[number]["key"];

interface ActiveFilterChipsProps {
  active: Record<ChipKey, boolean>;
}

export default function ActiveFilterChips({ active }: ActiveFilterChipsProps) {
  const [, setSearchParams] = useSearchParams();

  const visible = CHIP_FILTERS.filter(({ key }) => active[key]);
  if (visible.length === 0) return null;

  function remove(key: ChipKey) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete(key);
      return next;
    });
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {visible.map(({ key, label }) => (
        <span
          key={key}
          className="flex items-center gap-1 rounded-full bg-brand-black px-3 py-1 text-sm font-medium text-white"
        >
          {label}
          <button
            type="button"
            aria-label={`Remove ${label} filter`}
            onClick={() => remove(key)}
            className="ml-1 leading-none hover:opacity-70"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
