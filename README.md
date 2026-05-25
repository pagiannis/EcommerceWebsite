# 🛒 E-Shop Web Application

A full-stack, enterprise-grade e-commerce platform built with **React 19** and **Spring Boot (Java 25)**. This project implements a modern shopping experience with a robust admin management system, secure authentication, and a responsive UI/UX inspired by professional Figma designs.

---

## 🚀 Overview

This repository contains a complete e-commerce solution consisting of a dynamic React frontend and a high-performance Spring Boot backend. It handles the entire lifecycle of a digital store—from product discovery and filtering to secure checkout and order management.

### Key Highlights:
- **Product Variants:** Advanced stock management supporting combinations of Color and Size.
- **Secure Auth:** Session-based authentication with Spring Security and JDBC storage.
- **Optimistic Locking:** Ensures data integrity during high-traffic checkout scenarios.
- **Admin Dashboard:** Full-featured panel for managing products, brands, orders, and site settings.
- **Scalable Architecture:** PostgreSQL for production, H2 for testing, and built-in rate limiting.

---

## 🛠️ Technical Stack

### Frontend (`/client`)
- **Framework:** [React 19](https://react.dev/) (Vite)
- **Language:** TypeScript
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching:** [TanStack Query v5](https://tanstack.com/query/latest)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

### Backend (`/server`)
- **Framework:** [Spring Boot](https://spring.io/projects/spring-boot)
- **Language:** Java 25
- **Database:** PostgreSQL (Production) / H2 (Development/Testing)
- **Security:** Spring Security (Session JDBC, BCrypt)
- **API Docs:** [SpringDoc OpenAPI (Swagger)](https://springdoc.org/)
- **Performance:** Caffeine Cache, Bucket4j (Rate Limiting)
- **Build Tool:** Maven

---

## 📁 Project Structure

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

## ✨ Features

### 🛍️ Customer Experience
- **Smart Catalog:** Filter products by category, price, color, size, and style.
- **Search:** Instant search with autocomplete suggestions.
- **Product Details:** High-quality image carousels, detailed specs, and customer reviews.
- **Cart & Wishlist:** Persisted shopping cart and personal wishlist for logged-in users.
- **Checkout:** Multi-step checkout with address management and multiple payment methods (Card, PayPal, COD).
- **Reviews:** Rate products and leave testimonials for the shop.

### 🔐 Security & Integrity
- **Rate Limiting:** Protects `/login` and `/register` endpoints against brute-force attacks.
- **Session Persistence:** Sessions survive server restarts via JDBC storage.
- **Hardened Cookies:** `HttpOnly` and `SameSite=Strict` protection against XSS and CSRF.
- **Snapshotted Orders:** Orders lock in the price and product name at the time of purchase to maintain historical accuracy.

### ⚙️ Administration
- **Inventory Management:** CRUD for Products, Variants, Brands, and Categories.
- **Order Processing:** Monitor and update order statuses (Processing, Shipped, Delivered, etc.).
- **User Management:** View and manage registered users.
- **Dynamic Settings:** Update Tax rates and Shipping fees directly from the UI without code changes.

---

## 🚦 Getting Started

### Prerequisites
- Java 25+
- Node.js 20+
- PostgreSQL (optional, defaults to H2)

### Backend Setup
1. Navigate to `/server`.
2. Configure `src/main/resources/application.properties` (if using PostgreSQL).
3. Run with Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
4. Access Swagger UI at: `http://localhost:8080/swagger-ui.html`

### Frontend Setup
1. Navigate to `/client`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## 📖 API Documentation

- 🛒 [Public Products API](./docs/PRODUCTS_API.md)
- 🔑 [Admin Management API](./docs/ADMIN_API.md)

---

## 📄 License

This project was developed as part of the Deloitte Web Application Project.
