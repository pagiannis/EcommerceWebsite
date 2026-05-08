import { Navigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import Breadcrumb from '../components/ui/Breadcrumb';
import ProductImageGallery from '../components/product/ProductImageGallery';
import ProductInfo from '../components/product/ProductInfo';
import ProductTabs from '../components/product/ProductTabs';
import RelatedProducts from '../components/product/RelatedProducts';
import { useProduct } from '../hooks/useProduct';
import { useProductReviews } from '../hooks/useProductReviews';
import { useRelatedProducts } from '../hooks/useRelatedProducts';
import ProductDetailSkeleton from '../components/product/ProductDetailSkeleton';

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();

  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const { data: reviews = [] } = useProductReviews(productId);
  const { data: related = [] } = useRelatedProducts(product);

  if (!productId) return <Navigate to="/shop" />;

  if (isError) {
    if ((error as AxiosError)?.response?.status === 404) return <Navigate to="/shop" />;
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-lg font-medium">Something went wrong loading this product.</p>
          <button
            onClick={() => refetch()}
            className="rounded-full bg-brand-black px-6 py-2 text-sm text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !product) return <ProductDetailSkeleton />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Breadcrumb
        className="mb-8"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: product.category.charAt(0).toUpperCase() + product.category.slice(1), to: `/shop?category=${product.category}` },
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
