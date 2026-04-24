import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = 'mb-6' }: BreadcrumbProps) {
  return (
    <nav className={`text-sm text-gray-500 ${className}`}>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-2">›</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-black">
              {item.label}
            </Link>
          ) : (
            <span className="capitalize text-gray-900">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
