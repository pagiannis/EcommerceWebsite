import { FaCheckCircle } from "react-icons/fa";
import type { Review } from "../../types/review";
import StarRating from "../ui/StarRating";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <StarRating rating={review.rating} />
      <div className="mt-2 flex items-center gap-1">
        <span className="font-semibold text-gray-900">{review.author}</span>
        {review.verified && (
          <FaCheckCircle className="h-4 w-4 text-green-500" />
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600">{review.body}</p>
      <p className="mt-2 text-xs text-gray-400">Posted on {review.date}</p>
    </div>
  );
}
