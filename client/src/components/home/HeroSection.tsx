import { Link } from "react-router-dom";
import heroImg from "../../assets/hero.png";

const stats = [
  { value: "200+", label: "International Brands" },
  { value: "2,000+", label: "High-Quality Products" },
  { value: "30,000+", label: "Happy Customers" },
];

export default function HeroSection() {
  return (
    <section className="bg-brand-gray overflow-hidden">
      <div className="relative mx-auto flex max-w-7xl flex-col lg:flex-row lg:items-end px-4 lg:px-8 lg:min-h-[530px]">
        <div className="flex-1 text-center lg:text-left pt-12 pb-8 lg:py-20 relative z-10">
          <h1 className="font-display text-left text-5xl font-bold uppercase leading-tight tracking-tight text-brand-black lg:text-6xl">
            Find Clothes That Matches Your Style
          </h1>
          <p className="mt-4 max-w-lg text-left text-gray-600 lg:mx-0">
            Browse through our diverse range of meticulously crafted garments,
            designed to bring out your individuality and cater to your sense of
            style.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-full bg-brand-black w-full lg:w-auto lg:px-12 py-3 text-sm text-white transition hover:bg-gray-800"
          >
            Shop Now
          </Link>
          <div className="mt-10 grid grid-cols-2 items-center gap-4 lg:flex lg:justify-start lg:gap-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center justify-center lg:items-start lg:justify-start ${i === 2 ? "col-span-2" : ""} ${i === 1 ? "border-l border-gray-300 pl-4 lg:pl-8" : ""} ${i === 2 ? "lg:border-l lg:border-gray-300 lg:pl-8" : ""}`}
              >
                <div className="text-2xl lg:text-3xl font-extrabold text-brand-black text-center lg:text-left">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 text-center lg:text-left">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 -mx-14 lg:mx-0 flex items-end justify-center lg:justify-end">
          <img
            src={heroImg}
            alt="Fashion models"
            className="w-full object-cover object-top h-[110vw] lg:w-auto lg:h-[530px] lg:object-contain lg:object-bottom"
          />
        </div>
      </div>
    </section>
  );
}
