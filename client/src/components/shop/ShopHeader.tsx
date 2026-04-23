const SORT_OPTIONS = [
  "Most Popular",
  "Price: Low to High",
  "Price: High to Low",
  "Newest",
];

interface ShopHeaderProps {
  category: string;
  totalCount: number;
  sort: string;
  onSortChange: (sort: string) => void;
}

export { SORT_OPTIONS };

export default function ShopHeader({
  category,
  totalCount,
  sort,
  onSortChange,
}: ShopHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-extrabold capitalize text-brand-black">
          {category === "all" ? "All Products" : category}
        </h1>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <p className="text-sm text-gray-500">Showing {totalCount} Products</p>
        <div>
          Sort by:
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="py-1.5 text-sm font-medium outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
