import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { products } from "../data/products";
import type { Category } from "../types/category";
import type { ProductType } from "../types/productType";
import type { DressStyle } from "../types/dressStyle";
import type { Brand } from "../types/brand";
import type { FilterState } from "../types/filterState";
import type { Size } from "../types/size";
import FilterSidebar from "../components/home/FilterSidebar";
import ShopBreadcrumb from "../components/shop/ShopBreadcrumb";
import ShopHeader, { SORT_OPTIONS } from "../components/shop/ShopHeader";
import ProductGrid from "../components/shop/ProductGrid";
import ShopPagination from "../components/shop/ShopPagination";
import ActiveFilterChips from "../components/shop/ActiveFilterChips";

const ITEMS_PER_PAGE = 9;

const allColors = [...new Set(products.flatMap((p) => p.colors))];
const VALID_CATEGORIES: Category[] = ["men", "women", "kids", "accessories"];
const VALID_TYPES: ProductType[] = ["t-shirt", "jeans", "shirt", "polo", "hoodie", "shorts", "blazer"];
const VALID_STYLES: DressStyle[] = ["casual", "formal", "party", "gym"];
const VALID_BRANDS: Brand[] = ["nike", "levis", "tommy-hilfiger", "ralph-lauren", "hm", "zara", "calvin-klein"];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const filters: FilterState = useMemo(() => {
    const c = searchParams.get("category") ?? "all";
    const t = searchParams.get("type") ?? "all";
    const minP = Number(searchParams.get("minPrice") ?? "0");
    const maxP = Number(searchParams.get("maxPrice") ?? "650");
    const colors = searchParams.get("colors")?.split(",").filter(Boolean) ?? [];
    const sizes = (searchParams.get("sizes")?.split(",").filter(Boolean) ?? []) as Size[];
    return {
      category: VALID_CATEGORIES.includes(c as Category) ? (c as Category) : "all",
      productType: VALID_TYPES.includes(t as ProductType) ? (t as ProductType) : "all",
      dressStyle: VALID_STYLES.includes(searchParams.get("style") as DressStyle) ? (searchParams.get("style") as DressStyle) : "all",
      brand: VALID_BRANDS.includes(searchParams.get("brand") as Brand) ? (searchParams.get("brand") as Brand) : "all",
      priceRange: [minP, maxP],
      colors,
      sizes,
      onSale: searchParams.get("onSale") === "true",
      newArrivals: searchParams.get("newArrivals") === "true",
      topSelling: searchParams.get("topSelling") === "true",
    };
  }, [searchParams]);

  const sort = searchParams.get("sort") ?? SORT_OPTIONS[0];
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const filtered = useMemo(() => {
    let result = products.slice();

    if (filters.category !== "all") {
      result = result.filter((p) => p.category === filters.category);
    }
    if (filters.productType !== "all") {
      result = result.filter((p) => p.productType === filters.productType);
    }
    if (filters.dressStyle !== "all") {
      result = result.filter((p) => p.dressStyle === filters.dressStyle);
    }
    if (filters.brand !== "all") {
      result = result.filter((p) => p.brand === filters.brand);
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
    if (filters.newArrivals) {
      result = result.filter((p) => p.isNew);
    }
    if (filters.topSelling) {
      result = result.filter((p) => p.isBestSeller);
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
      if (f.productType === "all") next.delete("type");
      else next.set("type", f.productType);
      if (f.dressStyle === "all") next.delete("style");
      else next.set("style", f.dressStyle);
      if (f.brand === "all") next.delete("brand");
      else next.set("brand", f.brand);
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
      <ShopBreadcrumb category={filters.category} productType={filters.productType} dressStyle={filters.dressStyle} brand={filters.brand} />

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
            productType={filters.productType}
            brand={filters.brand}
            totalCount={filtered.length}
            currentStart={currentStart}
            currentEnd={currentEnd}
            sort={sort}
            onSortChange={handleSortChange}
            onFilterOpen={() => setFilterOpen(true)}
          />

          <ActiveFilterChips
            active={{
              onSale: filters.onSale,
              newArrivals: filters.newArrivals,
              topSelling: filters.topSelling,
            }}
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
