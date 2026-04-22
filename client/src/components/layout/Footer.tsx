import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaGithub, FaTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

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
                <FaTwitter className="h-4 w-4" />
              </a>
              {/* Facebook */}
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-black text-white hover:text-black"
              >
                <FaFacebookF className="h-4 w-4" />
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-black"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
              {/* GitHub */}
              <a
                href="https://github.com"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-black"
              >
                <FaGithub className="h-4 w-4" />
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
            {["Visa", "Mastercard", "PayPal", "Apple Pay", "G Pay"].map(
              (pay) => (
                <span
                  key={pay}
                  className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600"
                >
                  {pay}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
