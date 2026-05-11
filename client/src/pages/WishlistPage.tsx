import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function WishlistPage() {
  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-extrabold uppercase tracking-tight text-brand-black">
        Wishlist
      </h1>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Heart className="h-12 w-12 text-gray-200" />
        <h2 className="mt-4 text-base font-semibold text-gray-900">Your wishlist is empty</h2>
        <p className="mt-2 text-sm text-gray-500">
          Save items you love and come back to them anytime.
        </p>
        <Link
          to="/shop"
          className="mt-6 rounded-full bg-brand-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
