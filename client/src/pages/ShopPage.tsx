import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import {
  mapApiProduct,
  COLOR_HEX_TO_ENUM,
  BRAND_NAME,
  PRODUCT_TYPE_NAME,
  DRESS_STYLE_TO_API,
  SIZE_TO_API,
  SORT_TO_API,
  type ProductsParams,
} from "../services/productsService";
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
import ProductGridSkeleton from "../components/shop/ProductGridSkeleton";
import ShopPagination from "../components/shop/ShopPagination";
import ActiveFilterChips from "../components/shop/ActiveFilterChips";

const ITEMS_PER_PAGE = 9;

const allColors = Object.keys(COLOR_HEX_TO_ENUM);

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const filters: FilterState = useMemo(
    () => ({
      category: (searchParams.get("category") ?? "all") as Category | "all",
      productType: (searchParams.get("type") ?? "all") as ProductType | "all",
      dressStyle: (searchParams.get("style") ?? "all") as DressStyle | "all",
      brand: (searchParams.get("brand") ?? "all") as Brand | "all",
      priceRange: [
        Number(searchParams.get("minPrice") ?? "0"),
        Number(searchParams.get("maxPrice") ?? "650"),
      ],
      colors: searchParams.get("colors")?.split(",").filter(Boolean) ?? [],
      sizes: (searchParams.get("sizes")?.split(",").filter(Boolean) ??
        []) as Size[],
      onSale: searchParams.get("onSale") === "true",
      newArrivals: searchParams.get("newArrivals") === "true",
      topSelling: searchParams.get("topSelling") === "true",
    }),
    [searchParams],
  );

  const sort = searchParams.get("sort") ?? SORT_OPTIONS[0];
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const params = useMemo<ProductsParams>(() => {
    const p: ProductsParams = {
      page: page - 1,
      size: ITEMS_PER_PAGE,
      sort: SORT_TO_API[sort],
    };
    if (filters.category !== "all") p.category = filters.category;
    if (filters.productType !== "all")
      p.productTypeName = PRODUCT_TYPE_NAME[filters.productType];
    if (filters.dressStyle !== "all")
      p.dressStyle = DRESS_STYLE_TO_API[filters.dressStyle];
    if (filters.brand !== "all") p.brandName = BRAND_NAME[filters.brand];
    if (filters.priceRange[0] > 0) p.minPrice = filters.priceRange[0];
    if (filters.priceRange[1] < 650) p.maxPrice = filters.priceRange[1];
    if (filters.colors.length > 0) {
      const mapped = filters.colors
        .map((h) => COLOR_HEX_TO_ENUM[h])
        .filter(Boolean);
      if (mapped.length > 0) p.colors = mapped;
    }
    if (filters.sizes.length > 0) {
      p.filterSizes = filters.sizes.map((s) => SIZE_TO_API[s]).filter(Boolean);
    }
    if (filters.onSale) p.onSale = true;
    if (filters.topSelling) p.bestSelling = true;
    return p;
  }, [filters, sort, page]);

  const { data, isLoading, isError, refetch } = useProducts(params);

  const products = useMemo(
    () => data?.content.map(mapApiProduct) ?? [],
    [data],
  );

  const totalCount = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentStart =
    products.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const currentEnd = (page - 1) * ITEMS_PER_PAGE + products.length;

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
      <ShopBreadcrumb
        category={filters.category}
        productType={filters.productType}
        dressStyle={filters.dressStyle}
        brand={filters.brand}
      />

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
            totalCount={isLoading ? 0 : totalCount}
            currentStart={isLoading ? 0 : currentStart}
            currentEnd={isLoading ? 0 : currentEnd}
            isProductsLoading={isLoading}
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

          {isLoading ? (
            <ProductGridSkeleton />
          ) : isError ? (
            <div className="py-20 text-center">
              <p className="text-brand-red">Failed to load products.</p>
              <button
                onClick={() => refetch()}
                className="mt-4 rounded-full border border-black px-6 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}

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
