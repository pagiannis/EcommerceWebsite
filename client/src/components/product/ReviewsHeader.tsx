import { useEffect, useRef, useState } from "react";
import FilterIcon from "../ui/FilterIcon";
import { ChevronDown } from "lucide-react";

const SORT_OPTIONS = ["Latest", "Oldest", "Highest Rating", "Lowest Rating"];
const RATING_OPTIONS = [0, 4, 3, 2, 1] as const;

interface ReviewsHeaderProps {
  count: number;
  sort: string;
  minRating: number;
  onSortChange: (s: string) => void;
  onMinRatingChange: (r: number) => void;
}

export { SORT_OPTIONS };

export default function ReviewsHeader({
  count,
  sort,
  minRating,
  onSortChange,
  onMinRatingChange,
}: ReviewsHeaderProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-6 flex items-center justify-between">
      <h3 className="text-xl font-bold text-brand-black">
        All Reviews{" "}
        <span className="text-gray-400 font-normal text-base">({count})</span>
      </h3>
      <div className="flex items-center gap-3">
        {/* Rating filter */}
        <div ref={filterRef} className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className={`flex items-center justify-center rounded-full p-2.5 ${
              minRating > 0 ? "bg-brand-black" : "bg-brand-gray"
            }`}
            aria-label="Filter reviews"
          >
            <FilterIcon
              className={`h-5 w-5 ${minRating > 0 ? "text-white" : "text-brand-black"}`}
            />
          </button>
          {filterOpen && (
            <div className="absolute left-0 top-full z-10 mt-2 min-w-max rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Minimum Rating
              </p>
              <div className="flex flex-col gap-2">
                {RATING_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      onMinRatingChange(r);
                      setFilterOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition hover:bg-brand-gray ${
                      minRating === r
                        ? "bg-brand-gray font-semibold text-brand-black"
                        : "text-gray-600"
                    }`}
                  >
                    {r === 0 ? (
                      "All ratings"
                    ) : (
                      <>
                        <span className="text-yellow-400">{"★".repeat(r)}</span>
                        <span>& up</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort dropdown — desktop only */}
        <div ref={sortRef} className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full bg-brand-gray px-4 py-2.5 text-sm font-medium text-brand-black"
          >
            {sort}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${sortOpen ? "rotate-180" : ""}`}
            />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 min-w-max rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sort by
              </p>
              <div className="flex flex-col gap-2">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => {
                      onSortChange(o);
                      setSortOpen(false);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-left text-sm transition hover:bg-brand-gray ${
                      sort === o
                        ? "bg-brand-gray font-semibold text-brand-black"
                        : "text-gray-600"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="rounded-full bg-brand-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 whitespace-nowrap"
        >
          Write a Review
        </button>
      </div>
    </div>
  );
}
