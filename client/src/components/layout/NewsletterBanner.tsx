import { useState } from "react";

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmail("");
  }

  return (
    <section className="bg-brand-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 lg:flex-row lg:px-8">
        <h2 className="text-3xl font-display font-extrabold uppercase leading-tight text-white lg:max-w-sm">
          Stay upto date about our latest offers
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-3 sm:w-auto"
        >
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
              />
            </svg>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-full bg-white py-3 pl-9 pr-4 text-sm text-gray-900 outline-none sm:w-80"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-white py-3 text-sm font-semibold text-brand-black transition hover:bg-gray-100"
          >
            Subscribe to Newsletter
          </button>
        </form>
      </div>
    </section>
  );
}
