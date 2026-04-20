import { Link } from "react-router-dom";
import { products } from "../data/products";
import { testimonials } from "../data/testimonials";
import ProductCard from "../components/product/ProductCard";
import StarRating from "../components/ui/StarRating";
import heroImg from "../assets/hero.png";
import versaceLogo from "../assets/VersaceLogo.png";
import zaraLogo from "../assets/ZaraLogo.png";
import gucciLogo from "../assets/GucciLogo.png";
import pradaLogo from "../assets/PradaLogo.png";
import calvinKleinLogo from "../assets/CalvinKleinLogo.png";

const brandLogos = [
  { name: "Versace", src: versaceLogo },
  { name: "Zara", src: zaraLogo },
  { name: "Gucci", src: gucciLogo },
  { name: "Prada", src: pradaLogo },
  { name: "Calvin Klein", src: calvinKleinLogo },
];

const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
const topSelling = products.filter((p) => p.isBestSeller).slice(0, 4);

const dressStyles = [
  { label: "Casual", bg: "bg-white" },
  { label: "Formal", bg: "bg-brand-gray" },
  { label: "Party", bg: "bg-brand-gray" },
  { label: "Gym", bg: "bg-white" },
] as const;

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-gray">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-8 px-4 py-12 lg:flex-row lg:px-8 lg:py-20">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl font-extrabold uppercase leading-tight tracking-tight text-brand-black lg:text-6xl">
              Find Clothes That Matches Your Style
            </h1>
            <p className="mt-4 max-w-md text-gray-600 lg:mx-0 mx-auto">
              Browse through our diverse range of meticulously crafted garments,
              designed to bring out your individuality and cater to your sense
              of style.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block rounded-full bg-brand-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Shop Now
            </Link>
            <div className="mt-10 flex justify-center gap-8 lg:justify-start">
              {[
                { value: "200+", label: "International Brands" },
                { value: "2,000+", label: "High-Quality Products" },
                { value: "30,000+", label: "Happy Customers" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-3xl font-extrabold text-brand-black">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src={heroImg}
              alt="Fashion models"
              className="h-72 w-auto object-contain lg:h-[480px]"
            />
          </div>
        </div>
      </section>

      {/* Brand logos */}
      <section className="bg-brand-black py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-8 lg:gap-16 px-4 lg:px-8">
          {brandLogos.map((brand) => (
            <img
              key={brand.name}
              src={brand.src}
              alt={brand.name}
              className="h-5 w-auto object-contain lg:h-8"
            />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-extrabold uppercase tracking-tight text-brand-black">
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

      <hr className="mx-auto max-w-7xl border-gray-200" />

      {/* Top Selling */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-extrabold uppercase tracking-tight text-brand-black">
          Top Selling
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topSelling.map((p) => (
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

      {/* Browse by dress style */}
      <section className="bg-brand-gray py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-extrabold uppercase tracking-tight text-brand-black">
            Browse by Dress Style
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {dressStyles.map((style) => (
              <Link
                key={style.label}
                to={`/shop?category=${style.label.toLowerCase()}`}
                className={`group relative flex h-48 items-end overflow-hidden rounded-2xl ${style.bg} p-4 shadow-sm transition hover:shadow-md`}
              >
                <span className="text-xl font-bold text-brand-black">
                  {style.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-extrabold uppercase tracking-tight text-brand-black">
          Our Happy Customers
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="min-w-[280px] flex-shrink-0 rounded-2xl border border-gray-200 p-6"
            >
              <StarRating rating={t.rating} />
              <div className="mt-2 flex items-center gap-1">
                <span className="font-semibold text-gray-900">{t.author}</span>
                {t.verified && (
                  <svg
                    className="h-4 w-4 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600 line-clamp-4">
                {t.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
