import { Navigate, useParams } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import ProductImageGallery from '../components/product/ProductImageGallery';
import ProductInfo from '../components/product/ProductInfo';
import ProductTabs from '../components/product/ProductTabs';
import RelatedProducts from '../components/product/RelatedProducts';
import { useProduct } from '../hooks/useProduct';
import { useProductReviews } from '../hooks/useProductReviews';
import { useRelatedProducts } from '../hooks/useRelatedProducts';

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();

  const { data: product, isLoading, isError } = useProduct(productId);
  const { data: reviews = [] } = useProductReviews(productId);
  const { data: related = [] } = useRelatedProducts(product);

  if (!productId || isError) return <Navigate to="/shop" />;

  if (isLoading || !product)
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-center text-gray-400 lg:px-8">
        Loading...
      </div>
    );

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

      <ProductTabs description={product.description} reviews={reviews} />

      <RelatedProducts products={related} />
    </div>
  );
}
