# Admin API — Reference

Base URL: `http://localhost:8080`

> 🔑 **Όλα τα endpoints κάτω από `/api/admin/*` απαιτούν ADMIN role.** Επιστρέφουν `403 Forbidden` αν ο logged-in user δεν είναι ADMIN, ή `401 Unauthorized` αν δεν υπάρχει session.

## Default credentials

Μετά από fresh seed, ο `DataInitializer` δημιουργεί έναν default admin:

```
email:    admin@test.com
password: admin12345
```

> ⚠️ Άλλαξε αυτά τα credentials πριν το deployment. Σε production τα admin credentials πρέπει να έρχονται από env vars αντί για hardcoded seed.

## Περιεχόμενα

- [Pagination format](#pagination-format)
- [Common error responses](#common-error-responses)
- [Products](#products) — `/api/admin/products`
- [Product Variants](#product-variants) — `/api/admin/products/{productId}/variants`
- [Brands](#brands) — `/api/admin/brands`
- [Categories](#categories) — `/api/admin/categories`
- [Product Types](#product-types) — `/api/admin/product-types`
- [Users](#users) — `/api/admin/users`
- [Orders](#orders) — `/api/admin/orders`
- [App Reviews](#app-reviews) — `/api/admin/app-reviews`
- [Settings](#settings) — `/api/admin/settings`

---

## Pagination format

Τα list endpoints με μεγάλο potential dataset επιστρέφουν `Page<T>` (ίδιο shape με `GET /api/products`):

```json
{
  "content": [ ... ],
  "totalElements": 1234,
  "totalPages": 124,
  "number": 0,
  "size": 10,
  "first": true,
  "last": false
}
```

Default `page=0`, `size=20` για admin endpoints (max 100). Validation 400 αν παραβιαστούν τα όρια.

---

## Common error responses

| Status | Σημασία | Body example |
|---|---|---|
| `400` | Validation error / bad input | `{ "status": 400, "error": "Validation Failed", "errors": { "name": "..." } }` |
| `401` | Δεν είναι logged in | `{ "message": "Unauthorized" }` |
| `403` | Logged in αλλά όχι ADMIN | (Spring Security default) |
| `404` | Resource not found | `{ "message": "Brand not found" }` |
| `409` | Conflict (UNIQUE violation, FK dependency, optimistic lock) | `{ "message": "Cannot delete brand: 3 product(s) still use it" }` |
| `500` | Unexpected | `{ "message": "An unexpected error occurred" }` |

---

## Products

### `GET /api/admin/products` — List all products (paginated)

```
GET /api/admin/products?page=0&size=20
```

> ⚠️ Διαφέρει από το public `GET /api/products`: γυρίζει **ΟΛΑ** τα products, **και αυτά χωρίς variants**. Το public endpoint εξαιρεί τα incomplete επειδή ο customer δεν μπορεί να τα αγοράσει.

#### Response

```json
{
  "content": [
    {
      "id": 21,
      "name": "Premium Casual Shirt",
      "brand": "Calvin Klein",
      "category": "men",
      "price": 80.00,
      "originalPrice": 100.00,
      "discountPercent": 20,
      "rating": 4.5,
      "reviewCount": 182,
      "variantCount": 6,
      "createdAt": "2026-04-10T14:22:00"
    },
    {
      "id": 99,
      "name": "Brand New Hoodie",
      "brand": "Nike",
      "category": "men",
      "price": 55.00,
      "originalPrice": null,
      "discountPercent": null,
      "rating": 0.0,
      "reviewCount": 0,
      "variantCount": 0,
      "createdAt": "2026-05-21T10:30:00"
    }
  ],
  "totalElements": 65,
  "totalPages": 4,
  "number": 0,
  "size": 20,
  "first": true,
  "last": false
}
```

**Σημαντικό πεδίο: `variantCount`**

| Τιμή | Σημασία |
|---|---|
| `> 0` | Product είναι **ορατό** στο shop, customers μπορούν να αγοράσουν |
| `0` | Product **δεν εμφανίζεται** στο shop. Admin πρέπει να προσθέσει ≥1 variant μέσω `POST /api/admin/products/{id}/variants` για να γίνει αγοράσιμο |

> Σύσταση UI: στο admin list δείξε ένα warning badge (π.χ. "⚠ no variants") στα rows με `variantCount === 0`.

### `POST /api/admin/products` — Create product

Request body:
```json
{
  "name": "Premium Casual Shirt",
  "description": "...",
  "categoryId": 1,
  "brandId": 5,
  "productTypeId": 2,
  "dressStyle": "CASUAL",
  "price": 80.00,
  "originalPrice": 100.00,
  "discountPercent": 20
}
```

| Πεδίο | Required | Notes |
|---|---|---|
| `name` | ✅ | max 255 |
| `description` | ❌ | max 2000 |
| `categoryId`, `brandId`, `productTypeId` | ✅ | πρέπει να υπάρχουν |
| `dressStyle` | ✅ | enum: `CASUAL`, `FORMAL`, `PARTY`, `GYM` |
| `price` | ✅ | > 0 |
| `originalPrice` | ❌ | > 0 — αν `null`, frontend δεν δείχνει discount |
| `discountPercent` | ❌ | 0–100 |

Επιστρέφει `201 Created` με το πλήρες `ProductResponse` (ίδιο shape με `GET /api/products/{id}`).

> ⚠️ **Visibility note:** Το νέο product **δεν εμφανίζεται στο customer shop** (`GET /api/products`) μέχρι να προστεθεί τουλάχιστον 1 variant. Φαίνεται όμως άμεσα στο admin list (`GET /api/admin/products`) με `variantCount: 0` ώστε ο admin να ξέρει ότι χρειάζεται follow-up.

### `PUT /api/admin/products/{id}` — Update product

Ίδιο body με το POST. Όλα τα πεδία είναι **απαιτητά** στο update.

Επιστρέφει `200 OK` με `ProductResponse`.

### `DELETE /api/admin/products/{id}` — Delete product

Επιστρέφει `204 No Content`.

> ⚠️ Αν το product έχει associated reviews / orders, η βάση πετάει FK violation → `409 Conflict` με γενικό `"Data conflict — possibly duplicate or invalid reference"`. Καλύτερα να αλλάξεις soft-delete αν θες ιστορικότητα.

---

## Product Variants

### `POST /api/admin/products/{productId}/variants` — Add variant

Request:
```json
{
  "color": "BLACK",
  "size": "M",
  "stockQuantity": 25,
  "sku": "SKU-21-BLK-M"
}
```

- `color`: enum (`RED, BLUE, BLACK, WHITE, GREEN, YELLOW, PINK, GRAY, BROWN, PURPLE, ORANGE, NAVY`)
- `size`: enum (`XXS, XS, S, M, L, XL, XXL, XXXL, XXXXL`)
- `stockQuantity` ≥ 0
- `sku` required, **unique** στη βάση → `409` αν duplicate

Επιστρέφει `201 Created` με `ProductVariantResponse`.

### `PUT /api/admin/products/variants/{variantId}` — Update variant

Ίδιο body με το POST. Επιστρέφει `200 OK`.

### `DELETE /api/admin/products/variants/{variantId}` — Delete variant

Επιστρέφει `204 No Content`.

> ⚠️ **Dependency check:** Αν το variant υπάρχει σε ενεργό cart κάποιου χρήστη → `409 Conflict`:
> ```json
> { "message": "Cannot delete variant: it is currently in 3 user cart(s)" }
> ```
> Orders που έχουν historical reference σε αυτό το variant **δεν** μπλοκάρουν τη διαγραφή (το `OrderItem` κρατά snapshot fields).

---

## Brands

### `GET /api/admin/brands` — List (paginated)

```
GET /api/admin/brands?page=0&size=20
```

Επιστρέφει `Page<Brand>`. Default `size=20`, max 100.

### `POST /api/admin/brands` — Create

```json
{
  "name": "Nike",
  "logoUrl": "https://..."
}
```

- `name` required, max 255
- `logoUrl` optional, must be valid URL

Επιστρέφει `201 Created` με `Brand`.

### `PUT /api/admin/brands/{id}` — Update

Ίδιο body. Επιστρέφει `200 OK`.

### `DELETE /api/admin/brands/{id}` — Delete

> ⚠️ **Dependency check:** `409` αν υπάρχουν products με αυτό το brand:
> ```json
> { "message": "Cannot delete brand: 3 product(s) still use it" }
> ```

Επιστρέφει `204 No Content` αν επιτυχία.

---

## Categories

### `POST /api/admin/categories` — Create

```json
{
  "name": "men",
  "description": "Men's clothing collection",
  "imageUrl": "https://..."
}
```

Επιστρέφει `201 Created` με `CategoryResponse`.

### `PUT /api/admin/categories/{id}` — Update

Ίδιο body. Επιστρέφει `200 OK`.

### `DELETE /api/admin/categories/{id}` — Delete

> ⚠️ **Dependency check:** `409` αν υπάρχουν products στην category.

Επιστρέφει `204 No Content` αν επιτυχία.

---

## Product Types

### `GET /api/admin/product-types` — List (paginated)

Επιστρέφει `Page<ProductType>`. Default `size=20`.

### `POST /api/admin/product-types` — Create

```json
{ "name": "T-Shirt" }
```

Επιστρέφει `201 Created`.

### `PUT /api/admin/product-types/{id}` — Update

Ίδιο body. Επιστρέφει `200 OK`.

### `DELETE /api/admin/product-types/{id}` — Delete

> ⚠️ **Dependency check:** `409` αν υπάρχουν products που χρησιμοποιούν αυτόν τον τύπο.

---

## Users

### `GET /api/admin/users` — List (paginated)

```
GET /api/admin/users?page=0&size=20
```

Επιστρέφει `Page<UserResponse>`.

### `GET /api/admin/users/{id}` — Single user

Επιστρέφει `UserResponse`:
```json
{
  "id": 1,
  "email": "alice@example.com",
  "firstName": "Alice",
  "lastName": "Johnson",
  "phone": "6912345678",
  "role": "USER",
  "createdAt": "2026-01-15T10:30:00"
}
```

### `PUT /api/admin/users/{id}` — Update user

Όλα τα πεδία **προαιρετικά** — μόνο τα που στέλνονται ενημερώνονται.

```json
{
  "email": "new@example.com",
  "firstName": "Alice",
  "lastName": "Smith",
  "phone": "6912345678",
  "password": "newpassword123"
}
```

> ⚠️ Αν το νέο email υπάρχει ήδη σε άλλο user → `409` (`DataIntegrityViolationException` handler πιάνει το race).

### `PATCH /api/admin/users/{id}/role` — Change role

```
PATCH /api/admin/users/1/role?role=ADMIN
```

- `role` query param, enum `USER` ή `ADMIN`

Επιστρέφει `200 OK` με `UserResponse`.

> ⚠️ **Self-demotion guard:** Αν ο logged-in admin προσπαθήσει να υποβαθμίσει τον εαυτό του σε `USER`, επιστρέφεται `400 Bad Request` με μήνυμα `"You cannot demote your own admin account"`. Αυτό αποτρέπει lockout σε σενάριο μόνου admin.

### `DELETE /api/admin/users/{id}` — Delete user

> ⚠️ **Self-deletion guard:** Αν ο logged-in admin προσπαθήσει να διαγράψει τον εαυτό του, επιστρέφεται `400 Bad Request` με μήνυμα `"You cannot delete your own admin account"`.
>
> ⚠️ Αν ο user έχει orders/reviews → FK violation → `409`. Καλύτερα soft-delete αν θες ιστορικότητα.

Επιστρέφει `204 No Content`.

---

## Orders

### `GET /api/admin/orders` — List orders (paginated)

```
GET /api/admin/orders?status=PENDING&page=0&size=20
```

| Param | Τύπος | Default | Notes |
|---|---|---|---|
| `status` | enum | — | optional filter: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `page` | int | `0` | |
| `size` | int | `20` | max 100 |

Επιστρέφει `Page<OrderResponse>` με ίδιο OrderResponse shape με το user-facing endpoint (συμπεριλαμβάνει `items[]`, `subtotal`, `tax`, `total`, `createdAt` ως `"yyyy-MM-dd HH:mm:ss"`).

### `GET /api/admin/orders/{id}` — Single order με items

Επιστρέφει `OrderResponse`.

### `PATCH /api/admin/orders/{id}/status` — Change status

```
PATCH /api/admin/orders/5/status?status=SHIPPED
```

- `status` query param required

Επιστρέφει `200 OK` με ενημερωμένο `OrderResponse`.

> ⚠️ **Stock restore behavior:** Όταν status γίνεται `CANCELLED` και η προηγούμενη κατάσταση **δεν** ήταν `CANCELLED`, ο service επιστρέφει στο stock όλες τις ποσότητες των OrderItems. Idempotent: re-cancellation δεν επιστρέφει ξανά stock.

---

## App Reviews

### `GET /api/admin/app-reviews` — All app reviews

Επιστρέφει **όλες** τις κριτικές (approved + pending) ώστε ο admin να μπορεί να εγκρίνει νέες. Το public `GET /api/app-reviews` γυρίζει μόνο τις approved για το homepage testimonials.

```json
[
  {
    "id": 1,
    "userName": "Alice Johnson",
    "rating": 5,
    "comment": "Amazing experience!",
    "createdAt": "2026-03-15 10:30:00",
    "approved": false
  }
]
```

### `PATCH /api/admin/app-reviews/{id}/approve` — Approve review

Επιστρέφει `200 OK` με ενημερωμένο `AppReviewResponse` (`approved: true`).

### `DELETE /api/admin/app-reviews/{id}` — Delete review

Επιστρέφει `204 No Content`.

---

## Settings

Runtime-configurable τιμές. Ο admin τις αλλάζει χωρίς redeploy.

### `GET /api/admin/settings` — List all settings

```json
[
  {
    "key": "order.tax.rate",
    "value": "0.10",
    "description": "VAT rate applied to order subtotal (e.g. 0.10 = 10%)",
    "updatedAt": "2026-05-15 12:00:00"
  },
  {
    "key": "order.shipping.fee",
    "value": "5.00",
    "description": "Flat shipping fee added to every order",
    "updatedAt": "2026-05-15 12:00:00"
  }
]
```

### `PUT /api/admin/settings/{key}` — Update or insert

```
PUT /api/admin/settings/order.tax.rate
Content-Type: application/json
```

```json
{
  "value": "0.13",
  "description": "VAT αυξήθηκε σε 13%"
}
```

| Πεδίο | Required | Notes |
|---|---|---|
| `value` | ✅ | string, max 500 |
| `description` | ❌ | max 500 |

Επιστρέφει `200 OK` με `SettingResponse`. Το internal cache invalidate-άρεται — η **επόμενη** παραγγελία βλέπει τη νέα τιμή.

**Γνωστά keys:**

| Key | Τύπος value | Default | Επίδραση |
|---|---|---|---|
| `order.tax.rate` | decimal | `0.10` | Πολλαπλασιαστής φόρου στο `subtotal` (π.χ. `0.10` = 10% VAT) |
| `order.shipping.fee` | decimal | `5.00` | Flat shipping που προστίθεται σε κάθε order |

Αν admin καλέσει PUT με νέο `key` που δεν υπάρχει, δημιουργείται. Άρα μπορείς να προσθέσεις custom settings στο μέλλον χωρίς code change.

**Fallbacks:** αν το setting λείπει από τη βάση για κάποιο λόγο, το checkout χρησιμοποιεί hardcoded defaults (`0.10` / `5.00`) — δεν σπάει ποτέ.

---

## Side-effects checklist (γρήγορη αναφορά)

| Endpoint | Side-effect που πρέπει να ξέρει το frontend |
|---|---|
| `PATCH /orders/{id}/status → CANCELLED` | Stock επιστρέφει στα variants |
| `PUT /settings/{key}` | Cache invalidates, next order νέα τιμή |
| `DELETE /brands\|categories\|product-types/{id}` | 409 αν υπάρχουν associated products |
| `DELETE /products/variants/{id}` | 409 αν variant σε ενεργό cart |
| `PUT /users/{id}` με νέο email | 409 αν duplicate email |
