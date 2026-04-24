import { useState } from "react";
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
          <p className="max-w-2xl text-gray-600">{description}</p>
        )}

        {tab === "reviews" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-brand-black">
                All Reviews{" "}
                <span className="text-gray-400 font-normal text-base">
                  ({reviews.length})
                </span>
              </h3>
              <div className="flex items-center gap-3">
                {/* Filter icon */}
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full bg-brand-gray p-2.5"
                  aria-label="Filter reviews"
                >
                  <svg
                    className="h-5 w-5 text-brand-black"
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
                {/* Sort dropdown */}
                <div className="relative inline-flex items-center rounded-full bg-brand-gray px-4 py-2">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none cursor-pointer pr-5 text-sm font-medium text-brand-black outline-none"
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
                  className="rounded-full bg-brand-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Write a Review
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((review) => (
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
          </div>
        )}

        {tab === "faqs" && (
          <div className="max-w-2xl space-y-4">
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
