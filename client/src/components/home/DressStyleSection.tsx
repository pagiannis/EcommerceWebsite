import { Link } from "react-router-dom";
import casualImg from "../../assets/dressstyles/Casual.png";
import formalImg from "../../assets/dressstyles/Formal.png";
import partyImg from "../../assets/dressstyles/Party.png";
import gymImg from "../../assets/dressstyles/Gym.png";

const dressStyles = [
  { label: "Casual", img: casualImg, span: "lg:col-span-1" },
  { label: "Formal", img: formalImg, span: "lg:col-span-2" },
  { label: "Party", img: partyImg, span: "lg:col-span-2" },
  { label: "Gym", img: gymImg, span: "lg:col-span-1" },
] as const;

export default function DressStyleSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="rounded-3xl bg-brand-gray px-8 py-14 lg:px-12">
        <h2 className="font-display mb-8 text-center text-3xl font-extrabold uppercase tracking-tight text-brand-black">
          Browse by Dress Style
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {dressStyles.map((style) => (
            <Link
              key={style.label}
              to={`/shop?category=${style.label.toLowerCase()}`}
              className={`${style.span} group relative flex h-44 overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md sm:h-52 lg:h-60`}
            >
              <span className="relative z-10 text-lg font-bold text-brand-black lg:text-xl">
                {style.label}
              </span>
              <img
                src={style.img}
                alt={style.label}
                className="scale-130 group-hover:scale-140 transition-transform duration-300 absolute -right-6 top-1 h-full w-3/4 object-cover"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
