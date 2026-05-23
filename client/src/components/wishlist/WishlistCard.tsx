import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import type { WishlistItemResponse } from "../../services/wishlistService";
import { useToggleWishlist } from "../../hooks/useWishlist";
import StarRating from "../ui/StarRating";
import Badge from "../ui/Badge";

interface WishlistCardProps {
  item: WishlistItemResponse;
}

export default function WishlistCard({ item }: WishlistCardProps) {
  const { toggle, isPending } = useToggleWishlist(String(item.productId));

  return (
    <div className="group relative">
      <Link to={`/product/${item.productId}`} className="block">
        <div className="overflow-hidden rounded-2xl bg-brand-gray">
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs text-gray-400">{item.brand}</p>
          <h3 className="font-semibold text-gray-900 group-hover:underline">
            {item.productName}
          </h3>
          <StarRating rating={item.rating} />
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">${item.price.toFixed(2)}</span>
            {item.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${item.originalPrice.toFixed(2)}
              </span>
            )}
            {item.discountPercent && (
              <Badge label={`-${item.discountPercent}%`} variant="discount" />
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-label="Remove from wishlist"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-red-50 disabled:opacity-40"
      >
        <Heart className="h-4 w-4 fill-brand-red text-brand-red" />
      </button>
    </div>
  );
}
