import { useMemo } from "react";
import type { Review } from "../../types/review";
import ReviewsHeader, { SORT_OPTIONS } from "./ReviewsHeader";
import ReviewCard from "./ReviewCard";

interface ReviewsTabProps {
  reviews: Review[];
  sort: string;
  minRating: number;
  onSortChange: (s: string) => void;
  onMinRatingChange: (r: number) => void;
}

export { SORT_OPTIONS };

export default function ReviewsTab({
  reviews,
  sort,
  minRating,
  onSortChange,
  onMinRatingChange,
}: ReviewsTabProps) {
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
    <div>
      <ReviewsHeader
        count={processedReviews.length}
        sort={sort}
        minRating={minRating}
        onSortChange={onSortChange}
        onMinRatingChange={onMinRatingChange}
      />
      {processedReviews.length === 0 ? (
        <p className="py-10 text-center text-gray-400">
          No reviews match the selected filter.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {processedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
