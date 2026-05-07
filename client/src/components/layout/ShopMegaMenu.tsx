import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

// eslint-disable-next-line react-refresh/only-export-components
export const megaMenu = [
  {
    category: "men",
    label: "Men",
    types: ["T-Shirts", "Jeans", "Shirts", "Polo", "Hoodies", "Shorts", "Blazers"],
  },
  {
    category: "women",
    label: "Women",
    types: ["T-Shirts", "Jeans", "Hoodies"],
  },
  {
    category: "kids",
    label: "Kids",
    types: [],
  },
] as const;

const typeParam: Record<string, string> = {
  "T-Shirts": "t-shirt",
  Jeans: "jeans",
  Shirts: "shirt",
  Polo: "polo",
  Hoodies: "hoodie",
  Shorts: "shorts",
  Blazers: "blazer",
};

export default function ShopMegaMenu() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div className="relative" onMouseEnter={handleOpen} onMouseLeave={handleClose}>
      <button
        type="button"
        className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black"
      >
        Shop
        <FaChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 grid grid-cols-3 gap-8 rounded-xl border border-gray-100 bg-white px-8 py-6 shadow-lg w-[420px]">
          {megaMenu.map((col) => (
            <div key={col.category}>
              <Link
                to={`/shop?category=${col.category}`}
                className="mb-2 block text-sm font-bold text-brand-black hover:underline"
                onClick={() => setOpen(false)}
              >
                {col.label}
              </Link>
              <ul className="space-y-1.5">
                {col.types.length === 0 ? (
                  <li>
                    <Link
                      to={`/shop?category=${col.category}`}
                      className="text-sm text-gray-600 hover:text-black"
                      onClick={() => setOpen(false)}
                    >
                      All
                    </Link>
                  </li>
                ) : (
                  col.types.map((type) => (
                    <li key={type}>
                      <Link
                        to={`/shop?category=${col.category}&type=${typeParam[type]}`}
                        className="text-sm text-gray-600 hover:text-black"
                        onClick={() => setOpen(false)}
                      >
                        {type}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
