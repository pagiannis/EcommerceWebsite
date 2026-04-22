import { useRef } from "react";
import { testimonials } from "../../data/testimonials";
import StarRating from "../ui/StarRating";
import { FaCheckCircle } from "react-icons/fa";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";

export default function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth =
      scrollRef.current.querySelector("div")?.offsetWidth ?? 300;
    scrollRef.current.scrollBy({
      left: dir === "right" ? cardWidth + 16 : -(cardWidth + 16),
      behavior: "smooth",
    });
  };

  return (
    <section className="py-16">
      <div className="mx-auto mb-8 max-w-7xl px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-brand-black">
            Our Happy Customers
          </h2>
          <div className="flex gap-3">
            <button onClick={() => scroll("left")} aria-label="Previous">
              <IoArrowBack className="flex h-6 w-6 items-center justify-center" />
            </button>
            <button onClick={() => scroll("right")} aria-label="Next">
              <IoArrowForward className="flex h-6 w-6 items-center justify-center" />
            </button>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-24 bg-gradient-to-r from-white to-transparent lg:block" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-24 bg-gradient-to-l from-white to-transparent lg:block" />
        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-4 overflow-x-auto pb-4 px-4 lg:px-8"
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="w-[calc(100%-32px)] flex-shrink-0 rounded-2xl border border-gray-200 p-6 lg:w-[360px]"
            >
              <StarRating rating={t.rating} />
              <div className="mt-2 flex items-center gap-1">
                <span className="font-semibold text-gray-900">{t.author}</span>
                {t.verified && (
                  <FaCheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
