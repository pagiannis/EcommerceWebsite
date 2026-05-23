import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../types/product";
import StarRating from "../ui/StarRating";
import Badge from "../ui/Badge";
import { useAuthStore } from "../../store/authStore";
import { useToggleWishlist } from "../../hooks/useWishlist";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isLoggedIn = useAuthStore((s) => s.user !== null);
  const { isWishlisted, toggle, isPending } = useToggleWishlist(product.id);

  return (
    <div className="group relative">
      <Link to={`/product/${product.id}`} className="block">
        <div className="overflow-hidden rounded-2xl bg-brand-gray">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-semibold text-gray-900 group-hover:underline">
            {product.name}
          </h3>
          <StarRating
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${product.originalPrice}
              </span>
            )}
            {product.discountPercent && (
              <Badge
                label={`-${product.discountPercent}%`}
                variant="discount"
              />
            )}
          </div>
        </div>
      </Link>

      {isLoggedIn && (
        <button
          type="button"
          onClick={toggle}
          disabled={isPending}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
        >
          <Heart
            className={`h-4 w-4 transition ${isWishlisted ? "fill-brand-red text-brand-red" : "text-gray-400"}`}
          />
        </button>
      )}
    </div>
  );
}
