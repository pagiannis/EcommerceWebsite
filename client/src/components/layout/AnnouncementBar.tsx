import { useState } from 'react';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="relative bg-brand-black py-2 text-center text-sm text-white">
      Sign up and get 20% off to your first order.{' '}
      <a href="/shop" className="font-semibold underline hover:no-underline">
        Sign Up Now
      </a>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
