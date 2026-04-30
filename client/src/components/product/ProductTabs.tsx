import { useSearchParams } from "react-router-dom";
import type { Review } from "../../types/review";
import ProductDetailsTab from "./ProductDetailsTab";
import ReviewsTab, { SORT_OPTIONS } from "./ReviewsTab";
import FaqsTab from "./FaqsTab";

type Tab = "details" | "reviews" | "faqs";
const VALID_TABS: Tab[] = ["details", "reviews", "faqs"];

interface ProductTabsProps {
  description: string;
  reviews: Review[];
}

export default function ProductTabs({ description, reviews }: ProductTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get("tab") ?? "reviews";
  const tab: Tab = VALID_TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "reviews";
  const sort = searchParams.get("sort") ?? SORT_OPTIONS[0];
  const minRating = Math.max(0, Number(searchParams.get("minRating") ?? "0"));

  function handleTabChange(t: Tab) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (t === "reviews") next.delete("tab");
      else next.set("tab", t);
      return next;
    }, { preventScrollReset: true });
  }

  function handleSortChange(s: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (s === SORT_OPTIONS[0]) next.delete("sort");
      else next.set("sort", s);
      return next;
    }, { preventScrollReset: true });
  }

  function handleMinRatingChange(r: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (r === 0) next.delete("minRating");
      else next.set("minRating", String(r));
      return next;
    }, { preventScrollReset: true });
  }

  return (
    <div className="mt-14">
      <div className="flex border-b border-gray-200">
        {(["details", "reviews", "faqs"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTabChange(t)}
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
        {tab === "details" && <ProductDetailsTab description={description} />}
        {tab === "reviews" && (
          <ReviewsTab
            reviews={reviews}
            sort={sort}
            minRating={minRating}
            onSortChange={handleSortChange}
            onMinRatingChange={handleMinRatingChange}
          />
        )}
        {tab === "faqs" && <FaqsTab />}
      </div>
    </div>
  );
}
