import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/products';
import type { DressStyle } from '../types/dressStyle';
import type { FilterState } from '../types/filterState';
import FilterSidebar from '../components/filters/FilterSidebar';
import ProductCard from '../components/product/ProductCard';

const ITEMS_PER_PAGE = 9;
const SORT_OPTIONS = ['Most Popular', 'Price: Low to High', 'Price: High to Low', 'Newest'];

const allColors = [...new Set(products.flatMap(p => p.colors))];

function initialFilters(category: string): FilterState {
  const validCategories: DressStyle[] = ['casual', 'formal', 'party', 'gym'];
  return {
    category: validCategories.includes(category as DressStyle) ? (category as DressStyle) : 'all',
    priceRange: [0, 500],
    colors: [],
    sizes: [],
  };
}

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') ?? 'all';

  const [filters, setFilters] = useState<FilterState>(() => initialFilters(categoryParam));
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = products.slice();

    if (filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category);
    }
    result = result.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);
    if (filters.colors.length > 0) {
      result = result.filter(p => p.colors.some(c => filters.colors.includes(c)));
    }
    if (filters.sizes.length > 0) {
      result = result.filter(p => p.sizes.some(s => filters.sizes.includes(s)));
    }

    if (sort === 'Price: Low to High') result.sort((a, b) => a.price - b.price);
    else if (sort === 'Price: High to Low') result.sort((a, b) => b.price - a.price);

    return result;
  }, [filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleFilterChange(f: FilterState) {
    setFilters(f);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <a href="/" className="hover:text-black">Home</a>
        <span className="mx-2">›</span>
        <span className="capitalize text-gray-900">{filters.category === 'all' ? 'Shop' : filters.category}</span>
      </nav>

      <div className="flex gap-6 flex-col lg:flex-row">
        <FilterSidebar filters={filters} onChange={handleFilterChange} allColors={allColors} />

        <div className="flex-1">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold capitalize text-brand-black">
                {filters.category === 'all' ? 'All Products' : filters.category}
              </h1>
              <p className="text-sm text-gray-500">Showing {filtered.length} Products</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Sort by:
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {paginated.length === 0 ? (
            <div className="py-20 text-center text-gray-400">No products match your filters.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {paginated.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-brand-gray"
            >
              ← Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-full text-sm font-medium transition ${
                    n === page ? 'bg-brand-black text-white' : 'hover:bg-brand-gray text-gray-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-brand-gray"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
