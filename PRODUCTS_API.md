# Products API — Frontend Reference

Base URL: `http://localhost:8080`

---

## Endpoints

### 1. `GET /api/products` — Λίστα προϊόντων με φίλτρα

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

### 2. `GET /api/products/{id}` — Ένα προϊόν

```
GET /api/products/1
```

Επιστρέφει ένα `ProductResponse` (ίδια δομή με το content[] παραπάνω, συμπεριλαμβανομένων των variants).

---

### 3. `GET /api/products/search` — Αναζήτηση

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

### 4. `GET /api/products/autocomplete` — Προτάσεις αναζήτησης

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