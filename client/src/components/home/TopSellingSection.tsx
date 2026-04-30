import { Link } from "react-router-dom";
import { products } from "../../data/products";
import ProductCard from "../product/ProductCard";

const topSelling = products.filter((p) => p.isBestSeller).slice(0, 4);

export default function TopSellingSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h2 className="font-display mb-8 text-center text-3xl font-extrabold uppercase tracking-tight text-brand-black">
        Top Selling
      </h2>
      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
        {topSelling.map((p) => (
          <div key={p.id} className="w-[calc((100%-16px)/1.5)] flex-shrink-0 lg:w-auto">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          to="/shop?topSelling=true"
          className="inline-block rounded-full border border-gray-300 px-10 py-3 text-sm font-medium text-brand-black transition hover:bg-brand-gray"
        >
          View All
        </Link>
      </div>
    </section>
  );
}
