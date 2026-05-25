# E-Shop Web Application

A full-stack, enterprise-grade e-commerce platform built with **React.ts** and **Spring Boot (Java 25)**. This project implements a modern shopping experience with a robust admin management system, secure authentication, and a pixel-perfect UI/UX implementation of [this Figma design](https://www.figma.com/design/CUg7MBcDIyMI102Ve2eq3z/E-commerce-Website-Template--Freebie---Community-?node-id=0-1&p=f&t=FVfaRlPS1cf0kvaL-0).

---

## Overview

This repository contains a complete e-commerce solution consisting of a dynamic React frontend and a high-performance Spring Boot backend. It handles the entire lifecycle of a digital store—from product discovery and filtering to secure checkout and order management.

### App Screenshots:

#### Home
<table><tr>
  <td><img src="docs/screenshots/HomePageDesktop.png" width="600"/></td>
  <td><img src="docs/screenshots/HomePageMobile.png" width="180"/></td>
</tr></table>

#### Shop
<table><tr>
  <td><img src="docs/screenshots/ShopPageDesktop.png" width="600"/></td>
  <td><img src="docs/screenshots/ShopPageMobile.png" width="180"/></td>
</tr></table>

#### Product Detail
<img src="docs/screenshots/ProductDetailPageDesktop.png" width="700"/>
<img src="docs/screenshots/ProductDetailPageDesktop2.png" width="700"/>

#### Cart & Checkout
<img src="docs/screenshots/CartPageDesktop.png" width="700"/>
<img src="docs/screenshots/CheckoutPageDesktop.png" width="700"/>
<img src="docs/screenshots/CheckoutPageDesktop2.png" width="700"/>

#### Auth
<img src="docs/screenshots/LoginPageDesktop.png" width="700"/>

#### Account
<img src="docs/screenshots/OrdersPageDesktop.png" width="700"/>

#### Admin
<img src="docs/screenshots/AdminPanelDesktop.png" width="700"/>

---

## Features

### Customer Experience
- **Smart Catalog:** Filter products by category, price, color, size, and style.
- **Search:** Instant search with autocomplete suggestions.
- **Product Details:** High-quality image carousels, detailed specs, and customer reviews.
- **Cart & Wishlist:** Persisted shopping cart and personal wishlist for logged-in users.
- **Checkout:** Multi-step checkout with address management and multiple payment methods (Card, PayPal, COD).
- **Reviews:** Rate products and leave testimonials for the shop.

### Security & Integrity
- **Rate Limiting:** Protects /login and /register endpoints against brute-force attacks.
- **Session Persistence:** Sessions survive server restarts via JDBC storage.
- **Hardened Cookies:** `HttpOnly` and `SameSite=Strict` protection against XSS and CSRF.
- **Snapshotted Orders:** Orders lock in the price and product name at the time of purchase to maintain historical accuracy.

### Administration
- **Inventory Management:** CRUD for Products, Variants, Brands, and Categories.
- **Order Processing:** Monitor and update order statuses (Processing, Shipped, Delivered, etc.).
- **User Management:** View and manage registered users.
- **Dynamic Settings:** Update Tax rates and Shipping fees directly from the UI without code changes.

---

## Technical Stack

### Frontend (/client)
- **Framework:** [React](https://react.dev/) (Vite)
- **Language:** TypeScript
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Forms:** React Hook Form + Zod

### Backend (/server)
- **Framework:** [Spring Boot](https://spring.io/projects/spring-boot)
- **Language:** Java 25
- **Database:** PostgreSQL (Production) / H2 (Development/Testing)
- **Security:** Spring Security (Session JDBC, BCrypt)
- **API Docs:** [SpringDoc OpenAPI (Swagger)](https://springdoc.org/)
- **Performance:** Caffeine Cache, Bucket4j (Rate Limiting)
- **Build Tool:** Maven

---

## Project Structure

```text
EcommerceWebsite/
├── client/                # React TypeScript Frontend
│   ├── src/
│   │   ├── api/           # Axios instances & API hooks
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # View components (Home, Shop, Product, etc.)
│   │   ├── store/         # Zustand state management
│   │   └── types/         # TypeScript interfaces
│   └── public/            # Static assets
├── server/                # Spring Boot Backend
│   ├── src/main/java/com/ecommerce/server/
│   │   ├── config/        # Security, CORS, and Data initialization
│   │   ├── controller/    # REST API endpoints (Public & Admin)
│   │   ├── dto/           # Data Transfer Objects (Requests/Responses)
│   │   ├── models/        # JPA Entities (Product, Order, User, etc.)
│   │   ├── repository/    # Spring Data JPA Repositories
│   │   ├── security/      # Auth filters & Rate limiting
│   │   └── service/       # Business logic layer
│   └── src/resources/     # SQL schemas & application properties
└── docs/                  # Project documentation & API references
```


---


## License

This project is licensed under the [MIT License](LICENSE).
