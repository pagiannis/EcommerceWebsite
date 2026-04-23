import { Link } from "react-router-dom";

interface ShopBreadcrumbProps {
  category: string;
}

export default function ShopBreadcrumb({ category }: ShopBreadcrumbProps) {
  return (
    <nav className="mb-6 text-sm text-gray-500">
      <Link to="/" className="hover:text-black">
        Home
      </Link>
      <span className="mx-2">›</span>
      <span className="capitalize text-gray-900">
        {category === "all" ? "Shop" : category}
      </span>
    </nav>
  );
}
