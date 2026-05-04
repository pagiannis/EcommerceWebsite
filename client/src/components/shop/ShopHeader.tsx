import { useEffect, useRef, useState } from "react";
import type { Category } from "../../types/category";
import type { ProductType } from "../../types/productType";
import type { Brand } from "../../types/brand";
import FilterIcon from "../ui/FilterIcon";

const SORT_OPTIONS = [
  "Most Popular",
  "Price: Low to High",
  "Price: High to Low",
  "Newest",
];


const BRAND_LABELS: Record<Brand, string> = {
  nike: 'Nike',
  levis: "Levi's",
  'tommy-hilfiger': 'Tommy Hilfiger',
  'ralph-lauren': 'Ralph Lauren',
  hm: 'H&M',
  zara: 'Zara',
  'calvin-klein': 'Calvin Klein',
};

function buildTitle(category: Category | 'all', _productType: ProductType | 'all', brand: Brand | 'all'): string {
  if (brand !== 'all') return BRAND_LABELS[brand];
  if (category === 'all') return 'All Products';
  return category.charAt(0).toUpperCase() + category.slice(1);
}

interface ShopHeaderProps {
  category: Category | 'all';
  productType: ProductType | 'all';
  brand: Brand | 'all';
  totalCount: number;
  currentStart: number;
  currentEnd: number;
  sort: string;
  onSortChange: (sort: string) => void;
  onFilterOpen: () => void;
}

export { SORT_OPTIONS };

export default function ShopHeader({
  category,
  productType,
  brand,
  totalCount,
  currentStart,
  currentEnd,
  sort,
  onSortChange,
  onFilterOpen,
}: ShopHeaderProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const title = buildTitle(category, productType, brand);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-6 flex items-center justify-between">
      {/* Mobile layout */}
      <div className="flex items-center gap-2 lg:hidden">
        <h1 className="text-xl font-extrabold text-brand-black">
          {title}
        </h1>
        <span className="text-sm text-gray-500">
          Showing {currentStart}-{currentEnd} of {totalCount} Products
        </span>
      </div>

      {/* Desktop layout */}
      <h1 className="hidden lg:block text-2xl font-extrabold text-brand-black">
        {title}
      </h1>

      {/* Mobile: filter icon button */}
      <button
        type="button"
        onClick={onFilterOpen}
        className="flex items-center justify-center rounded-full bg-brand-gray p-2.5 lg:hidden"
        aria-label="Open filters"
      >
        <FilterIcon className="h-5 w-5 text-brand-black" />
      </button>

      {/* Desktop: count + sort */}
      <div className="hidden lg:flex items-center gap-3 text-sm text-gray-500">
        <span>
          Showing {currentStart}-{currentEnd} of {totalCount} Products
        </span>
        <div className="flex items-center gap-1">
          <span>Sort by:</span>
          <div ref={ref} className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-1 py-1 text-sm font-semibold text-brand-black"
            >
              {sort}
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {open && (
              <div className="absolute right-0 top-full z-10 mt-1 min-w-max rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => {
                      onSortChange(o);
                      setOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-brand-gray ${
                      o === sort
                        ? "font-semibold text-brand-black"
                        : "text-gray-600"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
