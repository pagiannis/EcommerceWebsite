import { useState } from "react";
import { MdOutlineEmail } from "react-icons/md";

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmail("");
  }

  return (
    <section className="bg-[linear-gradient(to_bottom,white_50%,#F2F0F1_50%)]">
      <div className="mx-auto max-w-7xl px-4 pt-10 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-brand-black px-8 py-10 lg:flex-row lg:px-16">
          <h2 className="text-3xl font-display font-extrabold uppercase leading-tight text-white lg:max-w-md">
            Stay upto date about our latest offers
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-3 sm:w-auto"
          >
            <div className="relative">
              <MdOutlineEmail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
      </div>
    </section>
  );
}
