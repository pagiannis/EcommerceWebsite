import { Link, Navigate, useParams } from 'react-router-dom';
import { products } from '../data/products';
import { reviews } from '../data/reviews';
import ProductImageGallery from '../components/product/ProductImageGallery';
import ProductInfo from '../components/product/ProductInfo';
import ProductTabs from '../components/product/ProductTabs';
import RelatedProducts from '../components/product/RelatedProducts';

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const product = products.find(p => p.id === productId);

  if (!productId || !product) return <Navigate to="/shop" />;

  const productReviews = reviews.filter(r => r.productId === product.id);
  const related = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <nav className="mb-8 text-sm text-gray-500">
        <Link to="/" className="hover:text-black">Home</Link>
        <span className="mx-2">›</span>
        <Link to="/shop" className="hover:text-black">Shop</Link>
        <span className="mx-2">›</span>
        <span className="capitalize text-gray-900">{product.category}</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="flex flex-col gap-10 lg:flex-row">
        <ProductImageGallery images={product.images} name={product.name} />
        <ProductInfo product={product} />
      </div>

      <ProductTabs description={product.description} reviews={productReviews} />

      <RelatedProducts products={related} />
    </div>
  );
}
