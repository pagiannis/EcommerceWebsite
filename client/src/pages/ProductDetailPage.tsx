import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { products, reviews } from '../data/products';
import type { Size } from '../types';
import { useCart } from '../context/CartContext';
import StarRating from '../components/ui/StarRating';
import Badge from '../components/ui/Badge';
import QuantityStepper from '../components/ui/QuantityStepper';
import ProductCard from '../components/product/ProductCard';

type Tab = 'details' | 'reviews' | 'faqs';

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const product = products.find(p => p.id === productId);

  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] ?? '');
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<Tab>('reviews');
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  // Early returns after all hooks
  if (!productId || !product) return <Navigate to="/shop" />;

  const productReviews = reviews.filter(r => r.productId === product.id);
  const youMightLike = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem(product!, selectedColor, selectedSize);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-500">
        <Link to="/" className="hover:text-black">Home</Link>
        <span className="mx-2">›</span>
        <Link to="/shop" className="hover:text-black">Shop</Link>
        <span className="mx-2">›</span>
        <span className="capitalize text-gray-900">{product.category}</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Product layout */}
      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Image gallery */}
        <div className="flex gap-4 lg:w-1/2">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`h-20 w-16 overflow-hidden rounded-xl border-2 transition ${
                  i === activeImage ? 'border-brand-black' : 'border-transparent'
                }`}
              >
                <img src={img} alt={`${product.name} view ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          {/* Main image */}
          <div className="flex-1 overflow-hidden rounded-2xl bg-brand-gray">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Product info */}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-brand-black">
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

          {/* Color selector */}
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

          {/* Size selector */}
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

          {/* Qty + Add to Cart */}
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
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <div className="flex border-b border-gray-200">
          {(['details', 'reviews', 'faqs'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium capitalize transition ${
                tab === t
                  ? 'border-b-2 border-brand-black text-brand-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {t === 'details' ? 'Product Details' : t === 'reviews' ? 'Rating & Reviews' : 'FAQs'}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === 'details' && (
            <p className="max-w-2xl text-gray-600">{product.description}</p>
          )}
          {tab === 'reviews' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">All Reviews ({productReviews.length})</h3>
                <button
                  type="button"
                  className="rounded-full bg-brand-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Write a Review
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {productReviews.map(review => (
                  <div key={review.id} className="rounded-2xl border border-gray-200 p-5">
                    <StarRating rating={review.rating} />
                    <div className="mt-2 flex items-center gap-1">
                      <span className="font-semibold text-gray-900">{review.author}</span>
                      {review.verified && (
                        <svg className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{review.body}</p>
                    <p className="mt-2 text-xs text-gray-400">Posted on {review.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'faqs' && (
            <div className="max-w-2xl space-y-4">
              {[
                { q: 'What is your return policy?', a: 'We accept returns within 30 days of purchase.' },
                { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days.' },
                { q: 'Do you ship internationally?', a: 'Yes, we ship to over 50 countries worldwide.' },
              ].map(faq => (
                <div key={faq.q} className="rounded-xl border border-gray-200 p-5">
                  <h4 className="font-semibold text-gray-900">{faq.q}</h4>
                  <p className="mt-1 text-sm text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* You Might Also Like */}
      {youMightLike.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-extrabold uppercase tracking-tight text-brand-black">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {youMightLike.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
