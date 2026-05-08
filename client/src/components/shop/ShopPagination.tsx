interface ShopPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | 'ellipsis';

function buildPages(current: number, total: number, max: number, siblings: number): PageItem[] {
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let left = Math.max(2, current - siblings);
  let right = Math.min(total - 1, current + siblings);

  // Extend window when clipped near edges so visible count stays consistent
  if (current - siblings < 2) right = Math.min(total - 1, right + (2 - (current - siblings)));
  if (current + siblings > total - 1) left = Math.max(2, left - (current + siblings - (total - 1)));

  const items: PageItem[] = [1];
  if (left > 2) items.push('ellipsis');
  for (let i = left; i <= right; i++) items.push(i);
  if (right < total - 1) items.push('ellipsis');
  items.push(total);

  return items;
}

function PageButton({ n, current, onPageChange }: { n: number; current: number; onPageChange: (p: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPageChange(n)}
      className={`h-9 w-9 rounded-md text-sm font-medium transition ${
        n === current ? 'bg-brand-gray text-black' : 'hover:bg-brand-gray text-gray-700'
      }`}
    >
      {n}
    </button>
  );
}

export default function ShopPagination({ page, totalPages, onPageChange }: ShopPaginationProps) {
  if (totalPages <= 1) return null;

  const mobilePages = buildPages(page, totalPages, 4, 0);
  const desktopPages = buildPages(page, totalPages, 6, 1);

  return (
    <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-brand-gray"
      >
        ← Previous
      </button>

      {/* Mobile: siblings=0, truncate after 4 pages */}
      <div className="flex gap-1 lg:hidden">
        {mobilePages.map((item, i) =>
          item === 'ellipsis' ? (
            <span key={`e${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-gray-400">…</span>
          ) : (
            <PageButton key={item} n={item} current={page} onPageChange={onPageChange} />
          )
        )}
      </div>

      {/* Desktop: siblings=1, truncate after 6 pages */}
      <div className="hidden gap-1 lg:flex">
        {desktopPages.map((item, i) =>
          item === 'ellipsis' ? (
            <span key={`e${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-gray-400">…</span>
          ) : (
            <PageButton key={item} n={item} current={page} onPageChange={onPageChange} />
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-brand-gray"
      >
        Next →
      </button>
    </div>
  );
}
