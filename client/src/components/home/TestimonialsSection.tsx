import { testimonials } from "../../data/testimonials";
import StarRating from "../ui/StarRating";

export default function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h2 className="font-display mb-8 text-center text-3xl font-extrabold uppercase tracking-tight text-brand-black">
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
            <p className="mt-2 text-sm text-gray-600 line-clamp-4">{t.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
