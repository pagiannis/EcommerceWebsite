import { Link } from "react-router-dom";

const socialIconClass = "h-4 w-4 fill-current";

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" className={socialIconClass} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className={socialIconClass} aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className={socialIconClass} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className={socialIconClass} aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const paymentIcons = [
  {
    name: "Visa",
    el: (
      <span className="font-display text-xs font-extrabold italic tracking-tight text-[#1A1F71]">
        VISA
      </span>
    ),
  },
  {
    name: "Mastercard",
    el: (
      <svg viewBox="0 0 38 24" className="h-4 w-7" aria-label="Mastercard">
        <circle cx="14" cy="12" r="9" fill="#EB001B" />
        <circle cx="24" cy="12" r="9" fill="#F79E1B" />
      </svg>
    ),
  },
  {
    name: "PayPal",
    el: (
      <span className="text-xs font-bold italic text-[#003087]">
        Pay<span className="text-[#009CDE]">Pal</span>
      </span>
    ),
  },
  {
    name: "Apple Pay",
    el: (
      <svg viewBox="0 0 24 24" className="h-4 w-7 fill-black" aria-label="Apple Pay">
        <path d="M17.05 11.97c-.03-2.62 2.14-3.88 2.24-3.94-1.22-1.78-3.13-2.03-3.81-2.06-1.62-.16-3.16.95-3.98.95-.83 0-2.1-.93-3.45-.9-1.77.03-3.4 1.03-4.31 2.61-1.84 3.19-.47 7.91 1.32 10.5.88 1.27 1.92 2.69 3.28 2.64 1.32-.05 1.81-.85 3.4-.85 1.59 0 2.04.85 3.43.82 1.42-.02 2.31-1.28 3.18-2.55.98-1.46 1.39-2.88 1.42-2.95-.03-.02-2.72-1.04-2.75-4.13M14.6 4.41c.73-.88 1.22-2.11 1.09-3.34-1.05.04-2.32.7-3.07 1.58-.67.78-1.27 2.03-1.11 3.23 1.18.09 2.37-.59 3.09-1.47" />
      </svg>
    ),
  },
  {
    name: "G Pay",
    el: (
      <span className="text-xs font-medium">
        <span className="text-[#4285F4]">G</span>
        <span className="text-[#EA4335]">P</span>
        <span className="text-[#FBBC04]">a</span>
        <span className="text-[#34A853]">y</span>
      </span>
    ),
  },
];

const links = {
  Company: ["About", "Features", "Works", "Career"],
  Help: [
    "Customer Support",
    "Delivery Details",
    "Terms & Conditions",
    "Privacy Policy",
  ],
  FAQ: ["Account", "Manage Deliveries", "Orders", "Payments"],
  Resources: [
    "Free eBooks",
    "Development Tutorial",
    "How to - Blog",
    "Youtube Playlist",
  ],
};

export default function Footer() {
  return (
    <footer className="bg-brand-gray">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2">
            <Link
              to="/"
              className="text-2xl font-display font-extrabold tracking-tight text-brand-black"
            >
              SHOP.CO
            </Link>
            <p className="mt-3 max-w-xs text-sm text-gray-600">
              We have clothes that suits your style and which you're proud to
              wear. From women to men.
            </p>
            <div className="mt-4 flex gap-3">
              {/* Twitter */}
              <a
                href="https://twitter.com"
                aria-label="Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-black"
              >
                <TwitterIcon />
              </a>
              {/* Facebook */}
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-black text-white hover:text-black"
              >
                <FacebookIcon />
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-black"
              >
                <InstagramIcon />
              </a>
              {/* GitHub */}
              <a
                href="https://github.com"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-black"
              >
                <GithubIcon />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-900">
                {title}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      to="/"
                      className="text-sm text-gray-600 hover:text-black"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
          <p className="text-xs text-gray-500">
            Shop.co © 2000-2023, All Rights Reserved
          </p>
          <div className="flex items-center gap-2">
            {paymentIcons.map(({ name, el }) => (
              <span
                key={name}
                className="flex items-center justify-center rounded border border-gray-200 bg-white px-2 py-1"
                aria-label={name}
              >
                {el}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
