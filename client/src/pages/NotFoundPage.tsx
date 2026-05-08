import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="font-display text-8xl font-extrabold text-brand-black">404</p>
      <h1 className="font-display mt-4 text-2xl font-bold uppercase tracking-tight text-brand-black">
        Page Not Found
      </h1>
      <p className="mt-3 text-gray-500">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-brand-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Back to Home
      </Link>
    </div>
  );
}
