import type { Product } from '../../types/product';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-display mb-8 text-center text-3xl font-extrabold uppercase tracking-tight text-brand-black">
        You Might Also Like
      </h2>
      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
        {products.map(p => (
          <div key={p.id} className="w-[calc((100%-16px)/1.5)] flex-shrink-0 lg:w-auto">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
