interface ShopPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ShopPagination({
  page,
  totalPages,
  onPageChange,
}: ShopPaginationProps) {
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
      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n)}
            className={`h-9 w-9 rounded-md text-sm font-medium transition ${
              n === page
                ? "bg-brand-black text-white"
                : "hover:bg-brand-gray text-gray-700"
            }`}
          >
            {n}
          </button>
        ))}
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
