# Ecommerce API Guide

Base URL: `http://localhost:8080/api`

Το API επικοινωνεί με το frontend (Vite) στο `http://localhost:5173`.  
Όλα τα responses είναι JSON.

---

## Πίνακας περιεχομένων

1. [Products](#1-products)
2. [Categories](#2-categories)
3. [Cart](#3-cart)
4. [Users](#4-users)
5. [Φίλτρα & Pagination](#5-φίλτρα--pagination)
6. [Enums](#6-enums)
7. [Αρχιτεκτονική](#7-αρχιτεκτονική)

---

## 1. Products

### `GET /api/products`
Επιστρέφει paginated λίστα προϊόντων με προαιρετικά φίλτρα.

**Query params:**
| Param | Τύπος | Default | Περιγραφή |
|---|---|---|---|
| `page` | int | 0 | Αριθμός σελίδας |
| `size` | int | 20 | Αποτελέσματα ανά σελίδα |
| `minPrice` | decimal | - | Ελάχιστη τιμή |
| `maxPrice` | decimal | - | Μέγιστη τιμή |
| `colors` | Color[] | - | Ένα ή περισσότερα χρώματα |
| `filterSizes` | Size[] | - | Ένα ή περισσότερα μεγέθη |
| `dressStyle` | DressStyle | - | Στυλ ένδυσης |
| `onSale` | boolean | - | `true` → μόνο προϊόντα με έκπτωση |
| `bestSelling` | boolean | - | `true` → μόνο με reviewCount ≥ 50 |
| `brandId` | long | - | Φιλτράρισμα βάσει brand |
| `productTypeId` | long | - | Φιλτράρισμα βάσει τύπου προϊόντος |

**Παράδειγμα:**
```
GET /api/products?colors=RED&colors=BLUE&minPrice=20&onSale=true&page=0&size=10
```

**Response:** `Page<ProductResponse>`

---

### `GET /api/products/{id}`
Επιστρέφει ένα προϊόν με όλες τις λεπτομέρειές του.

**Response:** `ProductResponse`

---

### `GET /api/products/search?query=...`
Αναζήτηση προϊόντων βάσει ονόματος (case-insensitive).

**Query params:**
| Param | Τύπος | Default |
|---|---|---|
| `query` | string | (υποχρεωτικό) |
| `page` | int | 0 |
| `size` | int | 20 |

**Παράδειγμα:**
```
GET /api/products/search?query=shirt&page=0&size=5
```

**Response:** `Page<ProductResponse>`

---

### `GET /api/products/{id}/variants`
Επιστρέφει τα διαθέσιμα variants (χρώμα, μέγεθος, stock) ενός προϊόντος.

**Response:** `List<ProductVariantResponse>`

---

## 2. Categories

### `GET /api/categories`
Επιστρέφει όλες τις κατηγορίες μαζί με το πλήθος των προϊόντων τους.

**Response:** `List<CategoryResponse>`

---

### `GET /api/categories/{id}`
Επιστρέφει μία κατηγορία βάσει ID.

**Response:** `CategoryResponse`

---

### `GET /api/categories/{categoryId}/products`
Επιστρέφει τα προϊόντα μιας κατηγορίας με τα ίδια φίλτρα όπως το `GET /api/products`.

**Query params:** Ίδιοι με το `GET /api/products` (εκτός από `page`/`size` που έχουν default τιμές).

**Παράδειγμα:**
```
GET /api/categories/3/products?dressStyle=CASUAL&minPrice=15&size=10
```

**Response:** `Page<ProductResponse>`

---

## 3. Cart

### `GET /api/cart/{userId}`
Επιστρέφει όλα τα items του καλαθιού ενός χρήστη.

**Response:** `List<CartItemResponse>`

---

### `POST /api/cart/{userId}`
Προσθέτει ένα προϊόν στο καλάθι.

**Request body:**
```json
{
  "variantId": 5,
  "quantity": 2
}
```

**Response:** `CartItemResponse` (HTTP 201 Created)

---

### `PUT /api/cart/{cartItemId}?quantity=3`
Ενημερώνει την ποσότητα ενός συγκεκριμένου cart item.

**Query params:**
| Param | Τύπος | Περιγραφή |
|---|---|---|
| `quantity` | int | Νέα ποσότητα |

**Response:** `CartItemResponse`

---

### `DELETE /api/cart/{cartItemId}`
Αφαιρεί ένα item από το καλάθι.

**Response:** `204 No Content`

---

## 4. Users

### `POST /api/users/test?email=...`
Δημιουργεί test χρήστη (για development).

**Query params:**
| Param | Τύπος |
|---|---|
| `email` | string |

**Response:** `User` (HTTP 201 Created)

---

### `GET /api/users/{id}`
Επιστρέφει έναν χρήστη βάσει ID.

**Response:** `User`

---

## 5. Φίλτρα & Pagination

### Pagination response format
Όλα τα paginated endpoints επιστρέφουν αντικείμενο της μορφής:
```json
{
  "content": [ ... ],
  "totalElements": 120,
  "totalPages": 6,
  "number": 0,
  "size": 20,
  "first": true,
  "last": false
}
```

### Πολλαπλές τιμές σε φίλτρα
Για `colors` και `filterSizes` περνάς πολλαπλές τιμές επαναλαμβάνοντας το param:
```
?colors=RED&colors=BLUE&filterSizes=S&filterSizes=M
```

### Πώς λειτουργεί η φιλτραρισμένη αναζήτηση
Το query γίνεται JOIN με τα `variants` ώστε να ψάχνει χρώμα/μέγεθος, και χρησιμοποιεί `DISTINCT` για να μην εμφανίζεται ένα προϊόν πολλές φορές. Τα φίλτρα που δεν δίνονται αγνοούνται αυτόματα (`NULL` check στο JPQL).

---

## 6. Enums

Οι παρακάτω τιμές χρησιμοποιούνται στα query params και στα responses:

### Color
`RED`, `BLUE`, `BLACK`, `WHITE`, `GREEN`, `YELLOW`, `PINK`, `GRAY`, `BROWN`, `PURPLE`, `ORANGE`, `NAVY`

### Size
`XS`, `S`, `M`, `L`, `XL`, `XXL`, `XXXL`

### DressStyle
`CASUAL`, `FORMAL`, `SPORT`, `PARTY`, `BUSINESS`

---

## 7. Αρχιτεκτονική

### Ροή request
```
HTTP Request
    ↓
Controller  (παραλαμβάνει params, επιστρέφει ResponseEntity)
    ↓
Service     (business logic, μετατρέπει Entity → DTO)
    ↓
Repository  (JPQL queries προς τη βάση)
    ↓
Database (PostgreSQL / H2)
```

### Response DTOs
| DTO | Πεδία |
|---|---|
| `ProductResponse` | id, name, description, category, brand, productType, dressStyle, price, originalPrice, discountPercent, rating, reviewCount, imageUrls[], variants[] |
| `ProductVariantResponse` | id, color, size, stockQuantity, sku, price |
| `CategoryResponse` | id, name, description, imageUrl, productCount |
| `CartItemResponse` | id, variantId, productName, color, size, quantity, unitPrice, subtotal |

> Τα nested objects (category, brand) επιστρέφονται ως απλά strings (μόνο το name) για να παραμένει το response επίπεδο και απλό.