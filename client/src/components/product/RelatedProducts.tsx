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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
