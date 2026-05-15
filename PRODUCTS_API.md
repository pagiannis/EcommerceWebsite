# Products API — Frontend Reference

Base URL: `http://localhost:8080`

---

## Permissions

| Σύμβολο | Σημασία |
|---|---|
| 🌐 | Public — δεν απαιτεί login |
| 🔒 | Απαιτεί login (SESSION cookie) |
| 👤 | Απαιτεί login + ο `userId` πρέπει να είναι ο logged-in user |
| 🔑 | Μόνο ADMIN |

---

## Endpoints

### 1. 🌐 `GET /api/products` — Λίστα προϊόντων με φίλτρα

Επιστρέφει σελιδοποιημένα αποτελέσματα. Όλα τα params είναι προαιρετικά.

#### Query Parameters

| Param | Τύπος | Default | Περιγραφή |
|---|---|---|---|
| `category` | string | — | Όνομα κατηγορίας (case-insensitive) |
| `page` | int | `0` | Αριθμός σελίδας (ξεκινά από 0) |
| `size` | int | `9` | Προϊόντα ανά σελίδα (max 100) |
| `minPrice` | decimal | — | Ελάχιστη τιμή |
| `maxPrice` | decimal | — | Μέγιστη τιμή |
| `colors` | enum[] | — | Φίλτρο χρωμάτων (πολλαπλά με κόμμα) |
| `filterSizes` | enum[] | — | Φίλτρο μεγεθών (πολλαπλά με κόμμα) |
| `dressStyle` | enum | — | Στυλ ένδυσης |
| `onSale` | boolean | — | Μόνο προϊόντα σε έκπτωση |
| `bestSelling` | boolean | — | Μόνο best sellers (reviewCount ≥ 50) |
| `topSelling` | boolean | — | Ταξινόμηση βάσει πωλήσεων (αγνοεί άλλα filters) |
| `brandName` | string | — | Όνομα brand (case-insensitive) |
| `productTypeName` | string | — | Τύπος προϊόντος (case-insensitive) |
| `sort` | enum | — | Ταξινόμηση |
| `minRating` | double | — | Ελάχιστη βαθμολογία (1–5) |

#### Τιμές Enums

**`colors`**: `RED`, `BLUE`, `BLACK`, `WHITE`, `GREEN`, `YELLOW`, `PINK`, `GRAY`, `BROWN`, `PURPLE`, `ORANGE`, `NAVY`

**`filterSizes`**: `XXS`, `XS`, `S`, `M`, `L`, `XL`, `XXL`, `XXXL`, `XXXXL`

**`dressStyle`**: `CASUAL`, `FORMAL`, `PARTY`, `GYM`

**`sort`**: `NEWEST`, `MOST_POPULAR`, `PRICE_ASC`, `PRICE_DESC`

#### Παραδείγματα

```
# Όλα τα προϊόντα
GET /api/products

# Ανδρικά
GET /api/products?category=men

# Γυναικεία, σελίδα 2
GET /api/products?category=women&page=1

# Με εύρος τιμής
GET /api/products?minPrice=20&maxPrice=100

# Μόνο εκπτώσεις, ταξινομημένα φθηνότερα πρώτα
GET /api/products?onSale=true&sort=PRICE_ASC

# Πολλαπλά χρώματα
GET /api/products?colors=RED,BLACK,WHITE

# Πολλαπλά μεγέθη
GET /api/products?filterSizes=S,M,L

# Συνδυασμός φίλτρων
GET /api/products?category=men&minPrice=30&maxPrice=120&colors=BLACK,WHITE&filterSizes=M,L&sort=NEWEST

# Best sellers με ελάχιστο rating
GET /api/products?bestSelling=true&minRating=4

# Συγκεκριμένο brand
GET /api/products?brandName=Nike

# Συγκεκριμένος τύπος
GET /api/products?productTypeName=Shirt

# Όλα τα φίλτρα μαζί
GET /api/products?category=men&page=0&size=9&minPrice=30&maxPrice=150&colors=BLACK,WHITE&filterSizes=M,L&dressStyle=CASUAL&onSale=true&bestSelling=true&brandName=Nike&productTypeName=Shirt&sort=PRICE_ASC&minRating=4
```

#### Response

```json
{
  "content": [
    {
      "id": 1,
      "name": "Premium Casual Shirt",
      "description": "...",
      "category": "men",
      "brand": "Calvin Klein",
      "productType": "Shirt",
      "dressStyle": "CASUAL",
      "price": 120.00,
      "originalPrice": 150.00,
      "discountPercent": 20,
      "rating": 4.5,
      "reviewCount": 182,
      "imageUrls": [
        "https://..."
      ],
      "variants": [
        {
          "id": 1,
          "color": "WHITE",
          "colorHex": "#FFFFFF",
          "size": "S",
          "stockQuantity": 53,
          "sku": "SKU-1-WHI-S",
          "price": 120.00
        }
      ]
    }
  ],
  "totalElements": 42,
  "totalPages": 5,
  "number": 0,
  "size": 9,
  "first": true,
  "last": false
}
```

---

### 2. 🌐 `GET /api/products/{id}` — Ένα προϊόν

```
GET /api/products/1
```

Επιστρέφει ένα `ProductResponse` (ίδια δομή με το content[] παραπάνω, συμπεριλαμβανομένων των variants).

---

### 3. 🌐 `GET /api/products/search` — Αναζήτηση

| Param | Τύπος | Default | Περιγραφή |
|---|---|---|---|
| `query` | string | **υποχρεωτικό** | Κείμενο αναζήτησης |
| `page` | int | `0` | Αριθμός σελίδας |
| `size` | int | `9` | Αποτελέσματα ανά σελίδα |

```
GET /api/products/search?query=shirt
GET /api/products/search?query=nike&page=0&size=9
```

Επιστρέφει ίδια paginated δομή με το `GET /api/products`.

---

### 4. 🌐 `GET /api/products/autocomplete` — Προτάσεις αναζήτησης

Για το search dropdown. Επιστρέφει έως 8 αποτελέσματα.

| Param | Τύπος | Περιγραφή |
|---|---|---|
| `query` | string | Κείμενο που πληκτρολογεί ο χρήστης |

```
GET /api/products/autocomplete?query=sh
```

#### Response

```json
[
  { "id": 1, "name": "Premium Casual Shirt", "imageUrl": "https://..." },
  { "id": 2, "name": "Slim Fit Shorts",      "imageUrl": "https://..." }
]
```

---

### 5. 🌐 `GET /api/reviews/product/{productId}` — Reviews προϊόντος με φίλτρα

Επιστρέφει τα reviews ενός προϊόντος. Υποστηρίζει φιλτράρισμα ανά rating και ταξινόμηση. Όλα τα params είναι προαιρετικά.

#### Query Parameters

| Param | Τύπος | Default | Περιγραφή |
|---|---|---|---|
| `sort` | enum | `LATEST` | Ταξινόμηση αποτελεσμάτων |
| `minRating` | int | `0` (=όλα) | Ελάχιστο rating (1–5) |

#### Τιμές Enums

**`sort`**: `LATEST`, `OLDEST`, `HIGHEST_RATING`, `LOWEST_RATING`

#### Παραδείγματα

```
# Όλα τα reviews (default: νεότερα πρώτα)
GET /api/reviews/product/21

# Μόνο reviews με rating >= 3
GET /api/reviews/product/21?minRating=3

# Ταξινομημένα από υψηλότερο rating
GET /api/reviews/product/21?sort=HIGHEST_RATING

# Συνδυασμός: rating >= 4, παλαιότερα πρώτα
GET /api/reviews/product/21?sort=OLDEST&minRating=4
```

#### Response

```json
[
  {
    "id": 5,
    "productId": 21,
    "userName": "Alice Johnson",
    "rating": 5,
    "comment": "Great fit and super comfortable. Will definitely order again.",
    "createdAt": "2026-03-10 14:22:00"
  },
  {
    "id": 12,
    "productId": 21,
    "userName": "Bob Smith",
    "rating": 4,
    "comment": "Nice product overall. Sizing is accurate.",
    "createdAt": "2026-02-05 09:11:00"
  }
]
```

---

### 6. 👤 `POST /api/reviews/user/{userId}` — Δημιουργία review

#### Request Body

```json
{
  "productId": 21,
  "rating": 4,
  "comment": "Very comfortable and fits perfectly."
}
```

| Πεδίο | Τύπος | Required | Περιγραφή |
|---|---|---|---|
| `productId` | Long | ✅ | ID προϊόντος |
| `rating` | int | ✅ | Βαθμολογία (1–5) |
| `comment` | string | ❌ | Κείμενο κριτικής (max 1000 χαρακτήρες) |

Επιστρέφει `201 Created` με το νέο `ReviewResponse`.

---

### 7. 👤 `DELETE /api/reviews/{reviewId}` — Διαγραφή review

```
DELETE /api/reviews/5
```

Μόνο ο συγγραφέας του review μπορεί να το σβήσει (αλλιώς `403 Forbidden`).

Επιστρέφει `204 No Content`.

---

### 8. 🌐 `GET /api/app-reviews` — App reviews (testimonials)

Επιστρέφει όλα τα approved app reviews για το homepage testimonials section.

```
GET /api/app-reviews
```

#### Response

```json
[
  {
    "id": 1,
    "userName": "Alice Johnson",
    "rating": 5,
    "comment": "Absolutely love this shop! The quality is outstanding and delivery was super fast.",
    "createdAt": "2026-03-15 10:30:00",
    "approved": true
  }
]
```

---

### 9. 👤 `POST /api/app-reviews/user/{userId}` — Υποβολή app review

#### Request Body

```json
{
  "rating": 5,
  "comment": "Amazing experience, will shop again!"
}
```

| Πεδίο | Τύπος | Required | Περιγραφή |
|---|---|---|---|
| `rating` | int | ✅ | Βαθμολογία (1–5) |
| `comment` | string | ✅ | Κείμενο κριτικής |

Επιστρέφει `201 Created`. Το review δημιουργείται με `approved: false` και γίνεται ορατό μόλις το εγκρίνει ο admin μέσω `PATCH /api/admin/app-reviews/{id}/approve`.

---

```
# Top selling products (ταξινόμηση βάσει πωλήσεων)
GET /api/products?topSelling=true&size=8
```

> ⚠️ Όταν το `topSelling=true` είναι ενεργό, αγνοούνται τα υπόλοιπα filters και η ταξινόμηση γίνεται αποκλειστικά βάσει πωλήσεων.

---

## Addresses

### 👤 `GET /api/users/{userId}/addresses` — Λίστα διευθύνσεων

```
GET /api/users/1/addresses
```

#### Response

```json
[
  {
    "id": 1,
    "street": "Ermou 12",
    "city": "Athens",
    "postalCode": "10563",
    "country": "Greece",
    "isDefault": true
  },
  {
    "id": 2,
    "street": "Tsimiski 45",
    "city": "Thessaloniki",
    "postalCode": "54623",
    "country": "Greece",
    "isDefault": false
  }
]
```

---

### 👤 `POST /api/users/{userId}/addresses` — Προσθήκη διεύθυνσης

```
POST /api/users/1/addresses
```

#### Request Body

```json
{
  "street": "Ermou 12",
  "city": "Athens",
  "postalCode": "10563",
  "country": "Greece",
  "isDefault": true
}
```

| Πεδίο | Τύπος | Required |
|---|---|---|
| `street` | string | ✅ |
| `city` | string | ✅ |
| `postalCode` | string | ✅ |
| `country` | string | ✅ |
| `isDefault` | boolean | ✅ |

Επιστρέφει `201 Created` με το νέο `AddressResponse`.

---

### 👤 `PUT /api/users/{userId}/addresses/{addressId}` — Επεξεργασία διεύθυνσης

```
PUT /api/users/1/addresses/2
```

Request body ίδιο με το POST. Επιστρέφει `200 OK` με το ενημερωμένο `AddressResponse`.

---

### 👤 `DELETE /api/users/{userId}/addresses/{addressId}` — Διαγραφή διεύθυνσης

```
DELETE /api/users/1/addresses/2
```

Επιστρέφει `204 No Content`.

---

### 👤 `PATCH /api/users/{userId}/addresses/{addressId}/default` — Ορισμός ως προεπιλεγμένη

```
PATCH /api/users/1/addresses/2/default
```

Αφαιρεί το `isDefault` από την υπάρχουσα default και το ορίζει στη διεύθυνση με `addressId`. Επιστρέφει `200 OK` με το ενημερωμένο `AddressResponse`.

---

## Cart

### Βήμα 1 — Βρες το variantId

Για να προσθέσεις προϊόν στο cart χρειάζεσαι το `variantId` (όχι το `productId`). Κάθε variant αντιστοιχεί σε συγκεκριμένο χρώμα + μέγεθος.

```
GET /api/products/{productId}/variants
```

```json
[
  { "id": 14, "color": "BLACK", "colorHex": "#000000", "size": "M", "stockQuantity": 23, "sku": "SKU-2-BLA-M", "price": 85.00 },
  { "id": 15, "color": "BLACK", "colorHex": "#000000", "size": "L", "stockQuantity": 10, "sku": "SKU-2-BLA-L", "price": 85.00 },
  { "id": 16, "color": "WHITE", "colorHex": "#FFFFFF", "size": "M", "stockQuantity": 5,  "sku": "SKU-2-WHI-M", "price": 85.00 }
]
```

Επιλέγεις το variant με το χρώμα και μέγεθος που θέλει ο χρήστης και παίρνεις το `id` του.

---

### 10. 👤 `POST /api/cart/{userId}` — Προσθήκη στο cart

```json
{
  "variantId": 14,
  "quantity": 2
}
```

Επιστρέφει `201 Created` με το νέο cart item.

---

### 11. 👤 `GET /api/cart/{userId}` — Προβολή cart

```
GET /api/cart/1
```

---

### 12. 🔒 `PUT /api/cart/{cartItemId}?quantity=3` — Αλλαγή ποσότητας

```
PUT /api/cart/7?quantity=3
```

Επιστρέφει `200 OK` με το ενημερωμένο cart item.

#### Πιθανά error responses

| Status | Πότε | Body |
|---|---|---|
| `400` | `quantity <= 0` ή `quantity > stockQuantity` | `{ "message": "Quantity must be greater than 0" }` ή `{ "message": "Requested quantity exceeds available stock. Available: X" }` |
| `403` | Το cart item δεν ανήκει στον logged-in user | `{ "message": "Access denied" }` |
| `404` | Δεν βρέθηκε το cart item | `{ "message": "Cart item not found" }` |

---

### 13. 🔒 `DELETE /api/cart/{cartItemId}` — Αφαίρεση από cart

```
DELETE /api/cart/7
```

Επιστρέφει `204 No Content`.

---

## Auth

### 🌐 `POST /api/users/login` — Login

```json
{ "email": "user@example.com", "password": "mypassword" }
```

Επιστρέφει `UserResponse` + set-cookie `SESSION=...`.

---

### 🌐 `POST /api/users/register` — Register

```json
{ "email": "user@example.com", "password": "mypassword", "firstName": "John", "lastName": "Doe", "phone": "6912345678" }
```

Επιστρέφει `201 Created` με `UserResponse`.

---

### 🌐 `POST /api/users/logout` — Logout

Επιστρέφει `204 No Content`. Το SESSION cookie ακυρώνεται.

> **Rate limiting:** Τα `/login` και `/register` έχουν per-IP rate limit (10/min για login, 50/hr για register). Αν ξεπεραστεί, επιστρέφεται `429 Too Many Requests` με body:
> ```json
> { "status": 429, "error": "Too Many Requests", "message": "Too many login attempts. Please try again later." }
> ```

---

### 👤 `GET /api/users/{id}` — Προφίλ χρήστη

### 👤 `PUT /api/users/{id}` — Ενημέρωση προφίλ

```json
{ "email": "new@example.com", "firstName": "John", "lastName": "Doe", "phone": "6912345678", "password": "newpassword" }
```

Όλα τα πεδία προαιρετικά. Επιστρέφει `UserResponse`.

---

### 👤 `DELETE /api/users/{id}` — Διαγραφή λογαριασμού

Επιστρέφει `204 No Content`.

---

## Orders

### 👤 `GET /api/orders/user/{userId}` — Παραγγελίες χρήστη

### 👤 `GET /api/orders/{orderId}` — Λεπτομέρειες παραγγελίας

### 👤 `POST /api/orders/user/{userId}/checkout` — Ολοκλήρωση αγοράς

```
POST /api/orders/user/1/checkout
Content-Type: application/json
```

#### Request Body

```json
{
  "shippingAddressId": 1,
  "paymentMethod": "CARD"
}
```

| Πεδίο | Τύπος | Required | Περιγραφή |
|---|---|---|---|
| `shippingAddressId` | Long | ✅ | ID διεύθυνσης αποστολής (πρέπει να ανήκει στον logged-in user) |
| `paymentMethod` | enum | ✅ | `CARD`, `PAYPAL`, ή `CASH_ON_DELIVERY` |

Επιστρέφει `201 Created` με `OrderResponse`.

#### Πιθανά error responses

| Status | Πότε | Body |
|---|---|---|
| `400` | Άδειο cart, ή στο cart υπάρχει item με quantity > stock (stale cart), ή λάθος `paymentMethod` value | `{ "message": "Not enough stock for ... Available: X, Requested: Y" }` |
| `403` | Η `shippingAddressId` δεν ανήκει στον user | `{ "message": "Address does not belong to user" }` |
| `404` | Δεν βρέθηκε διεύθυνση/χρήστης | `{ "message": "Address not found" }` |
| `409` | Race condition: άλλο checkout άλλαξε το stock την ίδια στιγμή | `{ "message": "Stock changed during checkout. Please review your cart and try again." }` |

Σε `409`, ο frontend πρέπει να επανα-φέρει το cart (`GET /api/cart/{userId}`) και να ζητήσει επιβεβαίωση από τον χρήστη πριν επανα-υποβληθεί ο checkout.

> ⚠️ **Breaking change**: παλιά τα `shippingAddressId` και `paymentMethod` περνούσαν ως query params. Τώρα στέλνονται ως JSON body. Επίσης το `paymentMethod` είναι enum — μη-έγκυρες τιμές επιστρέφουν `400`.

---

### 👤 `POST /api/orders/{orderId}/reorder` — Επανάληψη παραγγελίας

```
POST /api/orders/5/reorder?userId=1
```

Προσθέτει τα items της παλιάς παραγγελίας στο cart. Επιστρέφει `200 OK`:

```json
{
  "message": "Items added to cart",
  "skipped": ["Classic Blue Jeans (out of stock)"]
}
```

#### Πιθανά error responses

| Status | Πότε | Body |
|---|---|---|
| `403` | Η παραγγελία δεν ανήκει στον passed `userId` (service-level guard) | `{ "message": "Order does not belong to user" }` |
| `404` | Δεν βρέθηκε η παραγγελία | `{ "message": "Order not found" }` |

---

## Σφάλματα Validation (400)

Αν σταλούν λάθος τιμές:

```json
{
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "page": "must be greater than or equal to 0",
    "minRating": "must be greater than or equal to 1"
  }
}
```

Περιπτώσεις:
- `page < 0`
- `size < 1` ή `size > 100`
- `minPrice < 0`
- `minRating < 1` ή `minRating > 5`
- `minPrice > maxPrice` → επιστρέφεται απλό 400 με message `"minPrice must be less than or equal to maxPrice"` (αντί για το παλιό confusing "κανένα αποτέλεσμα")

---

## Admin Endpoints (🔑 ADMIN only)

> ⚠️ **Breaking change**: τα list endpoints για admin τώρα είναι paginated.
> Πριν επέστρεφαν `[...]`. Τώρα επιστρέφουν `Page<T>` με το ίδιο shape που
> ήδη χρησιμοποιεί το `GET /api/products` (`content[]`, `totalElements`,
> `totalPages`, `number`, `size`, `first`, `last`).

### Paginated list endpoints

| Endpoint | Default page size |
|---|---|
| `GET /api/admin/orders?status=PENDING&page=0&size=20` | 20 |
| `GET /api/admin/users?page=0&size=20` | 20 |
| `GET /api/admin/brands?page=0&size=20` | 20 |
| `GET /api/admin/product-types?page=0&size=20` | 20 |

Όλα αποδέχονται `page` (min 0) και `size` (1–100). Validation 400 αν έξω από όρια.

### Delete endpoints με dependency check

Τα παρακάτω επιστρέφουν `409 Conflict` (αντί για γενικό 500 από FK violation) αν υπάρχουν associated products:

| Endpoint | Όταν |
|---|---|
| `DELETE /api/admin/brands/{id}` | brand χρησιμοποιείται από προϊόντα |
| `DELETE /api/admin/categories/{id}` | category χρησιμοποιείται από προϊόντα |
| `DELETE /api/admin/product-types/{id}` | product type χρησιμοποιείται από προϊόντα |

Παράδειγμα body:
```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Cannot delete brand: 3 product(s) still use it",
  "timestamp": "2026-05-15T20:00:00"
}
```