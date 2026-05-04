import { Navigate, useParams } from 'react-router-dom';
import { products } from '../data/products';
import { reviews } from '../data/reviews';
import Breadcrumb from '../components/ui/Breadcrumb';
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
    .filter(p => p.id !== product.id && p.category === product.category && p.productType === product.productType)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Breadcrumb
        className="mb-8"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: product.category, to: `/shop?category=${product.category}` },
          { label: product.productType },
          { label: product.name },
        ]}
      />

      <div className="flex flex-col gap-10 lg:flex-row">
        <ProductImageGallery images={product.images} name={product.name} />
        <ProductInfo product={product} />
      </div>

      <ProductTabs description={product.description} reviews={productReviews} />

      <RelatedProducts products={related} />
    </div>
  );
}
