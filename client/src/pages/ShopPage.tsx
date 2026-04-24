import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { products } from "../data/products";
import type { DressStyle } from "../types/dressStyle";
import type { FilterState } from "../types/filterState";
import FilterSidebar from "../components/home/FilterSidebar";
import ShopBreadcrumb from "../components/shop/ShopBreadcrumb";
import ShopHeader, { SORT_OPTIONS } from "../components/shop/ShopHeader";
import ProductGrid from "../components/shop/ProductGrid";
import ShopPagination from "../components/shop/ShopPagination";

const ITEMS_PER_PAGE = 9;

const allColors = [...new Set(products.flatMap((p) => p.colors))];

function initialFilters(category: string): FilterState {
  const validCategories: DressStyle[] = ["casual", "formal", "party", "gym"];
  return {
    category: validCategories.includes(category as DressStyle)
      ? (category as DressStyle)
      : "all",
    priceRange: [0, 650],
    colors: [],
    sizes: [],
  };
}

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "all";

  const [filters, setFilters] = useState<FilterState>(() =>
    initialFilters(categoryParam),
  );
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = products.slice();

    if (filters.category !== "all") {
      result = result.filter((p) => p.category === filters.category);
    }
    result = result.filter(
      (p) =>
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
    );
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((c) => filters.colors.includes(c)),
      );
    }
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => filters.sizes.includes(s)),
      );
    }

    if (sort === "Price: Low to High") result.sort((a, b) => a.price - b.price);
    else if (sort === "Price: High to Low")
      result.sort((a, b) => b.price - a.price);

    return result;
  }, [filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentStart =
    filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const currentEnd = Math.min(page * ITEMS_PER_PAGE, filtered.length);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function handleFilterChange(f: FilterState) {
    setFilters(f);
    setPage(1);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <ShopBreadcrumb category={filters.category} />

      <div className="flex gap-6 flex-col lg:flex-row">
        <FilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          allColors={allColors}
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
        />

        <div className="flex-1">
          <ShopHeader
            category={filters.category}
            totalCount={filtered.length}
            currentStart={currentStart}
            currentEnd={currentEnd}
            sort={sort}
            onSortChange={setSort}
            onFilterOpen={() => setFilterOpen(true)}
          />

          <ProductGrid products={paginated} />

          <ShopPagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
