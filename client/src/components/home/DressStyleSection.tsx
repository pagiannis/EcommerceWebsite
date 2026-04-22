import { Link } from "react-router-dom";

const dressStyles = [
  { label: "Casual", bg: "bg-white" },
  { label: "Formal", bg: "bg-brand-gray" },
  { label: "Party", bg: "bg-brand-gray" },
  { label: "Gym", bg: "bg-white" },
] as const;

export default function DressStyleSection() {
  return (
    <section className="bg-brand-gray max-w-7xl mx-auto py-16 rounded-3xl">
      <div className="px-4 lg:px-8">
        <h2 className="font-display mb-8 text-center text-3xl font-extrabold uppercase tracking-tight text-brand-black">
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
  );
}
