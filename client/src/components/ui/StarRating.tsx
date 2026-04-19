interface StarRatingProps {
  rating: number;
  reviewCount?: number;
}

export default function StarRating({ rating, reviewCount }: StarRatingProps) {
  const pct = Math.min(100, Math.max(0, (rating / 5) * 100));
  return (
    <div className="flex items-center gap-1">
      <div className="relative inline-flex text-xl leading-none">
        <span className="text-gray-300">{'★★★★★'}</span>
        <span
          className="absolute inset-0 overflow-hidden text-yellow-400"
          style={{ width: `${pct}%` }}
        >
          {'★★★★★'}
        </span>
      </div>
      {reviewCount !== undefined && (
        <span className="text-sm text-gray-500">{rating}/5</span>
      )}
    </div>
  );
}
