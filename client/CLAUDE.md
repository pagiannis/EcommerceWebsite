# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router DOM v7 (`createBrowserRouter`)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` — no `tailwind.config.js`)
- **Backend**: Spring Boot (separate service, not yet created)

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Type-check (tsc -b) then Vite production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test runner is configured yet.

## Architecture

Client-side SPA with 4 pages: Home, Shop, Product Detail, Cart.

**Entry point**: `index.html` → `src/main.tsx` → `src/routes.tsx`

- `src/main.tsx` wraps `<App />` in `<CartProvider>` so cart state is available in the Navbar (which lives in the layout, outside `RouterProvider`)
- `src/routes.tsx` defines the router; all pages share `RootLayout` as the shell
- `src/layouts/RootLayout.tsx` renders AnnouncementBar + Navbar + `<Outlet>` + NewsletterBanner + Footer

**State**: Cart state lives in `src/context/CartContext.tsx`. `totalItems` and `subtotal` are derived with `useMemo` — never stored as separate state. Item identity key = `productId__color__size`. Later the Context integration will be replaced with Zustand

**Data**: All product/review/testimonial data is mocked in `src/data/`. Products use `placehold.co` placeholder images.

**Tailwind tokens** (in `src/index.css` `@theme {}` block):
- `bg-brand-black` / `text-brand-black` → `#000000`
- `bg-brand-gray` → `#F2F0F1`
- `text-brand-red` → `#FF3333`
- `font-display` → Integral CF (headings, brand text) — self-hosted in `public/fonts/`
- `font-sans` → Satoshi (body text, default on `<body>`) — loaded via Fontshare CDN

Range slider thumb styles must be in raw CSS (`::-webkit-slider-thumb`) — Tailwind utilities can't target pseudo-elements.

**TypeScript**: Strict mode (`noUnusedLocals`, `noUnusedParameters`). Use union types, not enums. TypeScript cannot narrow captured variables inside inner function declarations even after a type guard — use non-null assertion (`product!`) in those cases.

**ShopPage filtering**: `useMemo` over `src/data/products.ts` array; `useSearchParams` seeds the initial category filter from the URL query param `?category=`.
