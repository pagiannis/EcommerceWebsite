import { useState } from "react";
import type { DressStyle } from "../../types/dressStyle";
import type { FilterState } from "../../types/filterState";
import type { Size } from "../../types/size";
import ColorFilter from "./ColorFilter";
import SizeFilter from "./SizeFilter";
import PriceRangeSlider from "./PriceRangeSlider";
import { IoClose } from "react-icons/io5";

interface FilterContentProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  allColors: string[];
  onClose: () => void;
  showCloseButton: boolean;
}

const categories: { value: DressStyle | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "party", label: "Party" },
  { value: "gym", label: "Gym" },
];

export default function FilterContent({
  filters,
  onChange,
  allColors,
  onClose,
  showCloseButton,
}: FilterContentProps) {
  const [draft, setDraft] = useState<FilterState>(filters);

  function handleApply() {
    onChange(draft);
    onClose();
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {showCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="text-gray-400 hover:text-black"
          >
            <IoClose className="h-5 w-5" />
          </button>
        ) : (
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m-6 8a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4"
            />
          </svg>
        )}
      </div>

      <div className="border-b border-gray-200 py-4">
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.value}>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, category: cat.value })}
                className={`flex w-full items-center justify-between text-sm ${
                  draft.category === cat.value
                    ? "font-semibold text-brand-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {cat.label}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-b border-gray-200 py-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Price</h4>
        <PriceRangeSlider
          min={0}
          max={650}
          value={draft.priceRange}
          onChange={(range) => setDraft({ ...draft, priceRange: range })}
        />
      </div>

      <div className="border-b border-gray-200 py-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Colors</h4>
        <ColorFilter
          colors={allColors}
          selected={draft.colors}
          onChange={(colors) => setDraft({ ...draft, colors })}
        />
      </div>

      <div className="border-b border-gray-200 py-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Size</h4>
        <SizeFilter
          selected={draft.sizes}
          onChange={(sizes: Size[]) => setDraft({ ...draft, sizes })}
        />
      </div>

      <button
        type="button"
        onClick={handleApply}
        className="mt-4 w-full rounded-full bg-brand-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        Apply Filter
      </button>
    </>
  );
}
