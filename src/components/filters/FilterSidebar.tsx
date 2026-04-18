import type { DressStyle, FilterState, Size } from '../../types';
import ColorFilter from './ColorFilter';
import SizeFilter from './SizeFilter';
import PriceRangeSlider from './PriceRangeSlider';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  allColors: string[];
}

const categories: { value: DressStyle | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'party', label: 'Party' },
  { value: 'gym', label: 'Gym' },
];

export default function FilterSidebar({ filters, onChange, allColors }: FilterSidebarProps) {
  return (
    <aside className="w-full rounded-2xl border border-gray-200 p-5 lg:w-64 lg:flex-shrink-0">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m-6 8a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4" />
        </svg>
      </div>

      {/* Category */}
      <div className="border-b border-gray-200 py-4">
        <ul className="space-y-2">
          {categories.map(cat => (
            <li key={cat.value}>
              <button
                type="button"
                onClick={() => onChange({ ...filters, category: cat.value })}
                className={`flex w-full items-center justify-between text-sm ${
                  filters.category === cat.value ? 'font-semibold text-brand-black' : 'text-gray-600 hover:text-black'
                }`}
              >
                {cat.label}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div className="border-b border-gray-200 py-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Price</h4>
        <PriceRangeSlider
          min={0}
          max={500}
          value={filters.priceRange}
          onChange={range => onChange({ ...filters, priceRange: range })}
        />
      </div>

      {/* Colors */}
      <div className="border-b border-gray-200 py-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Colors</h4>
        <ColorFilter
          colors={allColors}
          selected={filters.colors}
          onChange={colors => onChange({ ...filters, colors })}
        />
      </div>

      {/* Sizes */}
      <div className="border-b border-gray-200 py-4">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">Size</h4>
        <SizeFilter
          selected={filters.sizes}
          onChange={(sizes: Size[]) => onChange({ ...filters, sizes })}
        />
      </div>

      <button
        type="button"
        onClick={() =>
          onChange({
            ...filters,
            colors: [],
            sizes: [],
            priceRange: [0, 500],
            category: 'all',
          })
        }
        className="mt-4 w-full rounded-full bg-brand-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        Apply Filter
      </button>
    </aside>
  );
}
