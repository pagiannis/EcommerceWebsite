# Product Sort — Πώς λειτουργεί

## Τι μπορείς να κάνεις

Σε οποιοδήποτε endpoint προϊόντων μπορείς να προσθέσεις `?sort=`:

```
GET /api/products?sort=PRICE_ASC
GET /api/categories/3/products?sort=MOST_POPULAR
```

### Διαθέσιμες τιμές

| Τιμή | Αποτέλεσμα |
|---|---|
| `NEWEST` | Πιο πρόσφατα πρώτα (createdAt DESC) |
| `MOST_POPULAR` | Περισσότερες κριτικές πρώτα (reviewCount DESC) |
| `PRICE_ASC` | Χαμηλότερη τιμή πρώτα |
| `PRICE_DESC` | Υψηλότερη τιμή πρώτα |

Αν δεν δώσεις `sort`, επιστρέφει με την προεπιλεγμένη σειρά της βάσης (id ASC).

---

## Ροή αιτήματος

```
GET /api/categories/3/products?sort=PRICE_ASC&page=0&size=20
        ↓
CategoryController
  παραλαμβάνει: sort=PRICE_ASC, page=0, size=20
  δημιουργεί:   PageRequest.of(0, 20)  ← χωρίς sort ακόμα
        ↓
CategoryService
  ελέγχει αν sort != null  → ΝΑΙ
  μετατρέπει:  PRICE_ASC → Sort.by(ASC, "price")
  αντικαθιστά: PageRequest.of(0, 20) → PageRequest.of(0, 20, Sort.by(ASC, "price"))
        ↓
ProductRepository.findByCategoryAndFilters(..., pageable)
  το Pageable πλέον περιέχει και το sort
        ↓
Spring Data JPA
  προσθέτει αυτόματα ORDER BY στο SQL
        ↓
SQL που εκτελείται:
  SELECT ... FROM products WHERE category_id = 3 ... ORDER BY price ASC LIMIT 20
```

---

## Ο κώδικας βήμα-βήμα

### Βήμα 1 — Enum (τι τιμές δέχεται)

```java
public enum ProductSort {
    NEWEST, MOST_POPULAR, PRICE_ASC, PRICE_DESC
}
```

Το Spring μετατρέπει αυτόματα το string `"PRICE_ASC"` από το URL στο enum `ProductSort.PRICE_ASC`.

---

### Βήμα 2 — Controller (παραλαβή)

```java
@GetMapping("/{categoryId}/products")
public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
        @RequestParam(required = false) ProductSort sort,   // ← optional
        ...) {
    return ResponseEntity.ok(categoryService.getProductsByCategoryWithFilters(
            categoryId, ..., sort, ...
    ));
}
```

`required = false` σημαίνει ότι αν δεν δοθεί sort, η τιμή είναι `null`.

---

### Βήμα 3 — Service (μετατροπή σε Sort object)

```java
if (sort != null) {
    Sort s = switch (sort) {
        case NEWEST       -> Sort.by(Direction.DESC, "createdAt");
        case MOST_POPULAR -> Sort.by(Direction.DESC, "reviewCount");
        case PRICE_ASC    -> Sort.by(Direction.ASC,  "price");
        case PRICE_DESC   -> Sort.by(Direction.DESC, "price");
    };
    // Αντικαθιστούμε το pageable με νέο που έχει και sort
    pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), s);
}
```

Το `PageRequest` είναι απλά ένα αντικείμενο που λέει στη βάση:
- ποια σελίδα θέλουμε (`getPageNumber`)
- πόσα αποτελέσματα (`getPageSize`)
- με ποια σειρά (`Sort`)

---

### Βήμα 4 — Repository (εκτέλεση)

```java
productRepository.findByCategoryAndFilters(..., pageable)
```

Δεν αλλάξαμε τίποτα στο JPQL query. Το Spring Data JPA διαβάζει το `Pageable`
και προσθέτει μόνο του `ORDER BY price ASC` στο τελικό SQL.

---

## Συνδυασμός με άλλα φίλτρα

Το sort συνδυάζεται ελεύθερα με οποιοδήποτε φίλτρο:

```
GET /api/categories/3/products?sort=PRICE_ASC&minPrice=20&onSale=true&colors=RED
```

→ Επιστρέφει τα κόκκινα, εκπτωτικά προϊόντα άνω των 20€, ταξινομημένα από φθηνό προς ακριβό.
