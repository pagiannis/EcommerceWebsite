import { useEffect, useMemo, useRef, useState } from "react";
import type { Review } from "../../types/review";
import StarRating from "../ui/StarRating";

type Tab = "details" | "reviews" | "faqs";

const FAQS = [
  {
    q: "What is your return policy?",
    a: "We accept returns within 30 days of purchase.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 3-5 business days.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship to over 50 countries worldwide.",
  },
];

const SORT_OPTIONS = ["Latest", "Oldest", "Highest Rating", "Lowest Rating"];
const RATING_OPTIONS = [0, 4, 3, 2, 1] as const;

interface ProductTabsProps {
  description: string;
  reviews: Review[];
}

export default function ProductTabs({
  description,
  reviews,
}: ProductTabsProps) {
  const [tab, setTab] = useState<Tab>("reviews");
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [minRating, setMinRating] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const processedReviews = useMemo(() => {
    let result = reviews.filter((r) => r.rating >= minRating);

    if (sort === "Latest")
      result = result.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    else if (sort === "Oldest")
      result = result.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    else if (sort === "Highest Rating")
      result = result.sort((a, b) => b.rating - a.rating);
    else if (sort === "Lowest Rating")
      result = result.sort((a, b) => a.rating - b.rating);

    return result;
  }, [reviews, sort, minRating]);

  return (
    <div className="mt-14">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200">
        {(["details", "reviews", "faqs"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 -mb-px py-4 text-base capitalize transition text-center ${
              tab === t
                ? "border-b-2 border-brand-black font-bold text-brand-black"
                : "font-medium text-gray-400 hover:text-black"
            }`}
          >
            {t === "details"
              ? "Product Details"
              : t === "reviews"
                ? "Rating & Reviews"
                : "FAQs"}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "details" && (
          <p className="text-gray-600">{description}</p>
        )}

        {tab === "reviews" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-brand-black">
                All Reviews{" "}
                <span className="text-gray-400 font-normal text-base">
                  ({processedReviews.length})
                </span>
              </h3>
              <div className="flex items-center gap-3">
                {/* Filter icon */}
                <div ref={filterRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setFilterOpen((o) => !o)}
                    className={`flex items-center justify-center rounded-full p-2.5 ${
                      minRating > 0 ? "bg-brand-black" : "bg-brand-gray"
                    }`}
                    aria-label="Filter reviews"
                  >
                    <svg
                      className={`h-5 w-5 ${minRating > 0 ? "text-white" : "text-brand-black"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m-6 8a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4"
                      />
                    </svg>
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
                              setMinRating(r);
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
                <div className="relative hidden sm:inline-flex items-center rounded-full bg-brand-gray px-4 py-2">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none cursor-pointer pr-5 text-sm font-medium text-brand-black outline-none bg-transparent"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 h-4 w-4 text-brand-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Write a Review */}
                <button
                  type="button"
                  className="rounded-full bg-brand-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 whitespace-nowrap"
                >
                  Write a Review
                </button>
              </div>
            </div>

            {processedReviews.length === 0 ? (
              <p className="py-10 text-center text-gray-400">
                No reviews match the selected filter.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {processedReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-gray-200 p-5"
                  >
                    <StarRating rating={review.rating} />
                    <div className="mt-2 flex items-center gap-1">
                      <span className="font-semibold text-gray-900">
                        {review.author}
                      </span>
                      {review.verified && (
                        <svg
                          className="h-4 w-4 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{review.body}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      Posted on {review.date}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "faqs" && (
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-gray-200 p-5"
              >
                <h4 className="font-semibold text-gray-900">{faq.q}</h4>
                <p className="mt-1 text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
