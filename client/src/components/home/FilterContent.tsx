import { useState } from "react";

import type { ProductType } from "../../types/productType";
import type { DressStyle } from "../../types/dressStyle";

import type { FilterState } from "../../types/filterState";
import type { Size } from "../../types/size";
import ColorFilter from "./ColorFilter";
import SizeFilter from "./SizeFilter";
import PriceRangeSlider from "./PriceRangeSlider";
import FilterIcon from "../ui/FilterIcon";
import { IoClose } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";

interface FilterContentProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  allColors: string[];
  onClose: () => void;
  showCloseButton: boolean;
}

const dressStyles: { value: DressStyle | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "party", label: "Party" },
  { value: "gym", label: "Gym" },
];

const productTypes: { value: ProductType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "t-shirt", label: "T-Shirts" },
  { value: "jeans", label: "Jeans" },
  { value: "shirt", label: "Shirts" },
  { value: "polo", label: "Polo" },
  { value: "hoodie", label: "Hoodies" },
  { value: "shorts", label: "Shorts" },
  { value: "blazer", label: "Blazers" },
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
          <FilterIcon className="h-5 w-5 text-gray-400" />
        )}
      </div>

      <div className="border-b border-gray-200 py-4">
        <ul className="space-y-2">
          {productTypes.map((t) => (
            <li key={t.value}>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, productType: t.value })}
                className={`flex w-full items-center justify-between text-sm ${
                  draft.productType === t.value
                    ? "font-semibold text-brand-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {t.label}
                <IoIosArrowForward className="h-4 w-4" />
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

      <div className="border-b border-gray-200 py-4">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Dress Style
        </h4>
        <ul className="space-y-2">
          {dressStyles.map((s) => (
            <li key={s.value}>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, dressStyle: s.value })}
                className={`flex w-full items-center justify-between text-sm ${
                  draft.dressStyle === s.value
                    ? "font-semibold text-brand-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {s.label}
                <IoIosArrowForward className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
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
