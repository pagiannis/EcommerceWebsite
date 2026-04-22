import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-brand-gray">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-semibold text-gray-900 group-hover:underline">{product.name}</h3>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
          )}
          {product.discountPercent && (
            <Badge label={`-${product.discountPercent}%`} variant="discount" />
          )}
        </div>
      </div>
    </Link>
  );
}
