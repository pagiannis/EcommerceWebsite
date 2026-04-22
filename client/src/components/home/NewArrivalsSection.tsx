import { Link } from "react-router-dom";
import { products } from "../../data/products";
import ProductCard from "../product/ProductCard";

const newArrivals = products.filter((p) => p.isNew).slice(0, 4);

export default function NewArrivalsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h2 className="font-display mb-8 text-center text-3xl font-extrabold uppercase tracking-tight text-brand-black">
        New Arrivals
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {newArrivals.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          to="/shop"
          className="inline-block rounded-full border border-gray-300 px-10 py-3 text-sm font-medium text-brand-black transition hover:bg-brand-gray"
        >
          View All
        </Link>
      </div>
    </section>
  );
}
