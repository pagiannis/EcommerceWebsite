import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import type { Product } from '../../types/product';
import type { Size } from '../../types/size';
import { useAddToCart } from '../../hooks/useCart';
import { useAuthStore } from '../../store/authStore';
import { useToggleWishlist } from '../../hooks/useWishlist';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';
import QuantityStepper from '../ui/QuantityStepper';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { mutate: addToCart, isPending: addingToCart } = useAddToCart();
  const isLoggedIn = useAuthStore((s) => s.user !== null);
  const { isWishlisted, toggle: toggleWishlist, isPending: togglingWishlist } = useToggleWishlist(product.id);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  const availableSizes = new Set(
    product.variants
      .filter((v) => v.colorHex === selectedColor && v.stockQuantity > 0)
      .map((v) => v.size)
  );

  const selectedVariant = selectedSize
    ? product.variants.find((v) => v.colorHex === selectedColor && v.size === selectedSize)
    : undefined;

  const isOutOfStock = !!selectedVariant && selectedVariant.stockQuantity === 0;

  function handleColorSelect(color: string) {
    setSelectedColor(color);
    if (selectedSize && !availableSizes.has(selectedSize)) {
      setSelectedSize(null);
    }
  }

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    if (!selectedVariant || isOutOfStock) return;
    addToCart(
      { product, color: selectedColor, size: selectedSize, variantId: selectedVariant.id, qty: quantity },
      {
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        },
      }
    );
  }

  return (
    <div className="flex-1">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-brand-black">
        {product.name}
      </h1>
      <div className="mt-2 flex items-center gap-2">
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        <span className="text-sm text-gray-500">({product.reviewCount})</span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-3xl font-bold text-brand-black">${product.price}</span>
        {product.originalPrice && (
          <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
        )}
        {product.discountPercent && (
          <Badge label={`-${product.discountPercent}%`} variant="discount" />
        )}
      </div>

      <p className="mt-4 text-sm text-gray-600">{product.description}</p>

      <hr className="my-5 border-gray-200" />

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Select Colors</h3>
        <div className="flex gap-2">
          {product.colors.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorSelect(color)}
              style={{ backgroundColor: color }}
              className={`h-9 w-9 rounded-full border-2 transition ${
                selectedColor === color ? 'border-brand-black scale-110' : 'border-transparent'
              }`}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      <hr className="my-5 border-gray-200" />

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Choose Size</h3>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map(size => {
            const available = availableSizes.has(size);
            return (
              <button
                key={size}
                type="button"
                disabled={!available}
                onClick={() => { setSelectedSize(size); setSizeError(false); }}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  !available
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 line-through'
                    : selectedSize === size
                      ? 'bg-brand-black text-white'
                      : 'bg-brand-gray text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
        {sizeError && (
          <p className="mt-2 text-xs text-brand-red">Please select a size before adding to cart.</p>
        )}
      </div>

      <hr className="my-5 border-gray-200" />

      <div className="flex items-center gap-4">
        <QuantityStepper value={quantity} onChange={setQuantity} disabled={addingToCart} />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || addingToCart}
          className={`flex-1 rounded-full py-3 text-sm font-semibold text-white transition ${
            added
              ? 'bg-green-600'
              : isOutOfStock
                ? 'cursor-not-allowed bg-gray-400'
                : addingToCart
                  ? 'cursor-wait bg-gray-600'
                  : 'bg-brand-black hover:bg-gray-800'
          }`}
        >
          {added ? (
            '✓ Added to Cart'
          ) : addingToCart ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding...
            </span>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            'Add to Cart'
          )}
        </button>
        {isLoggedIn && (
          <button
            type="button"
            onClick={toggleWishlist}
            disabled={togglingWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="flex flex-shrink-0 items-center justify-center rounded-full border border-gray-200 p-3 transition hover:border-brand-black disabled:opacity-40"
          >
            <Heart
              className={`h-5 w-5 transition ${isWishlisted ? 'fill-brand-red text-brand-red' : 'text-gray-700'}`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
