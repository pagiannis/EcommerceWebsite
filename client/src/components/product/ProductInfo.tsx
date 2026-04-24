import { useState } from 'react';
import type { Product } from '../../types/product';
import type { Size } from '../../types/size';
import { useCart } from '../../context/CartContext';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';
import QuantityStepper from '../ui/QuantityStepper';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedColor, selectedSize);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
              onClick={() => setSelectedColor(color)}
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
          {product.sizes.map(size => (
            <button
              key={size}
              type="button"
              onClick={() => { setSelectedSize(size); setSizeError(false); }}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                selectedSize === size
                  ? 'bg-brand-black text-white'
                  : 'bg-brand-gray text-gray-700 hover:bg-gray-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {sizeError && (
          <p className="mt-2 text-xs text-brand-red">Please select a size before adding to cart.</p>
        )}
      </div>

      <hr className="my-5 border-gray-200" />

      <div className="flex items-center gap-4">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex-1 rounded-full py-3 text-sm font-semibold text-white transition ${
            added ? 'bg-green-600' : 'bg-brand-black hover:bg-gray-800'
          }`}
        >
          {added ? '✓ Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
