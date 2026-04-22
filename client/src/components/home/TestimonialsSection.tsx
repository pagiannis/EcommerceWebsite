import { useRef } from "react";
import { testimonials } from "../../data/testimonials";
import StarRating from "../ui/StarRating";
import { FaCheckCircle } from "react-icons/fa";

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
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-brand-black">
          Our Happy Customers
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 transition hover:bg-brand-gray"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 transition hover:bg-brand-gray"
          >
            →
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto pb-4"
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
    </section>
  );
}
