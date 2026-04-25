import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { products } from "../data/products";
import type { DressStyle } from "../types/dressStyle";
import type { FilterState } from "../types/filterState";
import type { Size } from "../types/size";
import FilterSidebar from "../components/home/FilterSidebar";
import ShopBreadcrumb from "../components/shop/ShopBreadcrumb";
import ShopHeader, { SORT_OPTIONS } from "../components/shop/ShopHeader";
import ProductGrid from "../components/shop/ProductGrid";
import ShopPagination from "../components/shop/ShopPagination";

const ITEMS_PER_PAGE = 9;

const allColors = [...new Set(products.flatMap((p) => p.colors))];
const VALID_CATEGORIES: DressStyle[] = ["casual", "formal", "party", "gym"];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const filters: FilterState = useMemo(() => {
    const cat = searchParams.get("category") ?? "all";
    const minP = Number(searchParams.get("minPrice") ?? "0");
    const maxP = Number(searchParams.get("maxPrice") ?? "650");
    const colors = searchParams.get("colors")?.split(",").filter(Boolean) ?? [];
    const sizes = (searchParams.get("sizes")?.split(",").filter(Boolean) ?? []) as Size[];
    return {
      category: VALID_CATEGORIES.includes(cat as DressStyle) ? (cat as DressStyle) : "all",
      priceRange: [minP, maxP],
      colors,
      sizes,
      onSale: searchParams.get("onSale") === "true",
    };
  }, [searchParams]);

  const sort = searchParams.get("sort") ?? SORT_OPTIONS[0];
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

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
    if (filters.onSale) {
      result = result.filter((p) => p.discountPercent != null);
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
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (f.category === "all") next.delete("category");
      else next.set("category", f.category);
      if (f.priceRange[0] === 0) next.delete("minPrice");
      else next.set("minPrice", String(f.priceRange[0]));
      if (f.priceRange[1] === 650) next.delete("maxPrice");
      else next.set("maxPrice", String(f.priceRange[1]));
      if (f.colors.length) next.set("colors", f.colors.join(","));
      else next.delete("colors");
      if (f.sizes.length) next.set("sizes", f.sizes.join(","));
      else next.delete("sizes");
      next.delete("page");
      return next;
    });
  }

  function handleSortChange(s: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (s === SORT_OPTIONS[0]) next.delete("sort");
      else next.set("sort", s);
      next.delete("page");
      return next;
    });
  }

  function handlePageChange(newPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPage === 1) next.delete("page");
      else next.set("page", String(newPage));
      return next;
    });
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

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
            onSortChange={handleSortChange}
            onFilterOpen={() => setFilterOpen(true)}
          />

          {filters.onSale && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded-full bg-brand-black px-3 py-1 text-sm font-medium text-white">
                On Sale
                <button
                  type="button"
                  aria-label="Remove On Sale filter"
                  onClick={() =>
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete("onSale");
                      return next;
                    })
                  }
                  className="ml-1 leading-none hover:opacity-70"
                >
                  ×
                </button>
              </span>
            </div>
          )}

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
