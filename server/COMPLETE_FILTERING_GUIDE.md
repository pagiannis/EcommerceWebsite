# COMPLETE FILTERING SYSTEM - Αναλυτικό Οδηγό

## 📋 Πίνακας Περιεχομένων

1. [Τι Είναι τα Φίλτρα](#τι-είναι-τα-φίλτρα)
2. [9 Φίλτρα Συνολικά](#9-φίλτρα-συνολικά)
3. [Architecture](#architecture)
4. [Layer-by-Layer Implementation](#layer-by-layer-implementation)
5. [Complete Data Flow](#complete-data-flow)
6. [API Examples](#api-examples)
7. [Database Queries](#database-queries)
8. [Tests & Edge Cases](#tests--edge-cases)

---

## Τι Είναι τα Φίλτρα

**Φίλτρα** = Κριτήρια που ο χρήστης επιλέγει για να περιορίσει τα αποτελέσματα.

```
ΧΩΡΙΣ ΦΙΛΤΡΑ:
GET /api/products
↓
Returns: ΌΛΑ τα 500+ products

ΜΕ ΦΙΛΤΡΑ:
GET /api/products?minPrice=50&maxPrice=200&color=BLUE&onSale=true
↓
Returns: Μόνο 15 products που είναι BLUE, κοστίζουν 50-200€, και είναι on sale
```

---

## 9 Φίλτρα Συνολικά

### Κατηγορία A: Variant-Level (από product_variants table)

| # | Φίλτρο | Type | Multiple? | SQL |
|----|--------|------|-----------|-----|
| 1  | **Color** | List<Color> | ✅ YES | `v.color IN (:colors)` |
| 2  | **Size** | List<Size> | ✅ YES | `v.size IN (:sizes)` |

### Κατηγορία B: Product-Level (από products table)

| # | Φίλτρο | Type | Multiple? | SQL |
|----|--------|------|-----------|-----|
| 3  | **Price Range** | BigDecimal | ❌ NO | `p.price BETWEEN :min AND :max` |
| 4  | **Dress Style** | DressStyle | ❌ NO | `p.dressStyle = :style` |
| 5  | **On Sale** | Boolean | ❌ NO | `p.discountPercent > 0` |
| 6  | **Best Selling** | Boolean | ❌ NO | `p.reviewCount >= 50` |
| 7  | **Brand** | Long (ID) | ❌ NO | `p.brand.id = :brandId` |
| 8  | **Product Type** | Long (ID) | ❌ NO | `p.productType.id = :typeId` |

### Κατηγορία C: Σχέση (από categories table)

| # | Φίλτρο | Type | Multiple? | SQL |
|----|--------|------|-----------|-----|
| 9  | **Category** | Long (ID) | ❌ NO | `p.category.id = :categoryId` |

---

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────┐
│ CLIENT (Frontend/Browser)               │
│ GET /api/products?colors=BLUE,RED&...   │
└──────────────────┬──────────────────────┘
                   │ (API Layer)
                   ↓
┌─────────────────────────────────────────┐
│ ProductController                       │
│ - Receives @RequestParam                │
│ - Validates input                       │
│ - Calls ProductService                  │
└──────────────────┬──────────────────────┘
                   │ (Service Layer)
                   ↓
┌─────────────────────────────────────────┐
│ ProductService                          │
│ - Business logic                        │
│ - Calls ProductRepository               │
│ - Converts Entity → DTO                 │
└──────────────────┬──────────────────────┘
                   │ (Repository Layer)
                   ↓
┌─────────────────────────────────────────┐
│ ProductRepository                       │
│ - @Query with JPA QL                    │
│ - Passes params to Hibernate            │
└──────────────────┬──────────────────────┘
                   │ (SQL Translation)
                   ↓
┌─────────────────────────────────────────┐
│ PostgreSQL Database                     │
│ - Executes SQL query                    │
│ - Returns matching rows                 │
└────────────────────────────────────────┘
```

---

## Layer-by-Layer Implementation

### Layer 1️⃣: ProductRepository (Database Layer)

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
        SELECT DISTINCT p FROM Product p
        JOIN p.variants v
        WHERE (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (size(:colors) = 0 OR v.color IN (:colors))
          AND (size(:sizes) = 0 OR v.size IN (:sizes))
          AND (:dressStyle IS NULL OR p.dressStyle = :dressStyle)
          AND (:onSale = false OR p.discountPercent > 0)
          AND (:bestSelling = false OR p.reviewCount >= 50)
          AND (:brandId IS NULL OR p.brand.id = :brandId)
          AND (:productTypeId IS NULL OR p.productType.id = :productTypeId)
    """)
    Page<Product> findByFilters(
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("colors") List<Color> colors,
            @Param("sizes") List<Size> sizes,
            @Param("dressStyle") DressStyle dressStyle,
            @Param("onSale") Boolean onSale,
            @Param("bestSelling") Boolean bestSelling,
            @Param("brandId") Long brandId,
            @Param("productTypeId") Long productTypeId,
            Pageable pageable
    );

    @Query("""
        SELECT DISTINCT p FROM Product p
        JOIN p.variants v
        WHERE p.category.id = :categoryId
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (size(:colors) = 0 OR v.color IN (:colors))
          AND (size(:sizes) = 0 OR v.size IN (:sizes))
          AND (:dressStyle IS NULL OR p.dressStyle = :dressStyle)
          AND (:onSale = false OR p.discountPercent > 0)
          AND (:bestSelling = false OR p.reviewCount >= 50)
          AND (:brandId IS NULL OR p.brand.id = :brandId)
          AND (:productTypeId IS NULL OR p.productType.id = :productTypeId)
    """)
    Page<Product> findByCategoryAndFilters(
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("colors") List<Color> colors,
            @Param("sizes") List<Size> sizes,
            @Param("dressStyle") DressStyle dressStyle,
            @Param("onSale") Boolean onSale,
            @Param("bestSelling") Boolean bestSelling,
            @Param("brandId") Long brandId,
            @Param("productTypeId") Long productTypeId,
            Pageable pageable
    );

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
}
```

**Key Points:**
- `JOIN p.variants v` → Συνδέει με variants (για Color/Size)
- `SELECT DISTINCT p` → Αποτρέπει διπλότυπα (1 product με 5 variants = 5 rows)
- `size(:colors) = 0` → Έλεγχος άδειας λίστας για colors
- `size(:sizes) = 0` → Έλεγχος άδειας λίστας για sizes

---

### Layer 2️⃣: ProductService (Business Logic)

```java
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductResponse> getFilteredProducts(
            BigDecimal minPrice,
            BigDecimal maxPrice,
            List<Color> colors,
            List<Size> sizes,
            DressStyle dressStyle,
            Boolean onSale,
            Boolean bestSelling,
            Long brandId,
            Long productTypeId,
            Pageable pageable) {

        // Call repository with all parameters
        return productRepository.findByFilters(
                minPrice, maxPrice, colors, sizes, dressStyle,
                onSale != null ? onSale : false,
                bestSelling != null ? bestSelling : false,
                brandId, productTypeId, pageable
        ).map(this::convertToResponse);  // Convert Entity → DTO
    }

    private ProductResponse convertToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory().getName(),
                product.getBrand().getName(),
                product.getProductType().getName(),
                product.getDressStyle().toString(),
                product.getPrice(),
                product.getOriginalPrice(),
                product.getDiscountPercent(),
                product.getRating(),
                product.getReviewCount(),
                product.getImages().stream()
                        .map(ProductImage::getImageUrl)
                        .toList(),
                product.getVariants().stream()
                        .map(v -> new ProductVariantResponse(
                                v.getId(),
                                v.getColor().toString(),
                                v.getSize().toString(),
                                v.getStockQuantity(),
                                v.getSku(),
                                product.getPrice()
                        ))
                        .toList()
        );
    }
}
```

**Key Points:**
- Κάνει null checks για Boolean φίλτρα (onSale, bestSelling)
- Μετατρέπει Product entities σε ProductResponse DTOs
- Διαχωρίζει business logic από database logic

---

### Layer 3️⃣: ProductController (API Layer)

```java
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<Color> colors,
            @RequestParam(required = false) List<Size> filterSizes,
            @RequestParam(required = false) DressStyle dressStyle,
            @RequestParam(required = false) Boolean onSale,
            @RequestParam(required = false) Boolean bestSelling,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long productTypeId) {

        return ResponseEntity.ok(productService.getFilteredProducts(
                minPrice, maxPrice, colors, filterSizes, dressStyle,
                onSale, bestSelling, brandId, productTypeId,
                PageRequest.of(page, size)
        ));
    }
}
```

**Key Points:**
- `@RequestParam(required = false)` → Όλα τα φίλτρα είναι optional
- Spring αυτόματα μετατρέπει `colors=BLUE,RED` → `List<Color> [BLUE, RED]`
- `PageRequest.of(page, size)` → Pagination object

---

### Layer 4️⃣: CategoryService (Similar)

```java
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public Page<ProductResponse> getProductsByCategoryWithFilters(
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            List<Color> colors,
            List<Size> sizes,
            DressStyle dressStyle,
            Boolean onSale,
            Boolean bestSelling,
            Long brandId,
            Long productTypeId,
            Pageable pageable) {

        // Validate category exists
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Call repository with categoryId
        return productRepository.findByCategoryAndFilters(
                categoryId, minPrice, maxPrice, colors, sizes, dressStyle,
                onSale != null ? onSale : false,
                bestSelling != null ? bestSelling : false,
                brandId, productTypeId, pageable
        ).map(this::convertProductToResponse);
    }
}
```

---

### Layer 5️⃣: CategoryController (Similar)

```java
@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/{categoryId}/products")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<Color> colors,
            @RequestParam(required = false) List<Size> filterSizes,
            @RequestParam(required = false) DressStyle dressStyle,
            @RequestParam(required = false) Boolean onSale,
            @RequestParam(required = false) Boolean bestSelling,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long productTypeId) {

        return ResponseEntity.ok(categoryService.getProductsByCategoryWithFilters(
                categoryId, minPrice, maxPrice, colors, filterSizes, dressStyle,
                onSale, bestSelling, brandId, productTypeId,
                PageRequest.of(page, size)
        ));
    }
}
```

---

## Complete Data Flow

### Example: User λέει "Δείξε μου BLUE και RED shirts, μέγεθος M ή L, σε sale, 50-200€"

```
┌─────────────────────────────────────────────────┐
│ STEP 1: FRONTEND BUILD URL                      │
├─────────────────────────────────────────────────┤
│ User Selections:                                │
│ ├─ Colors: BLUE, RED (multiple)                │
│ ├─ Sizes: M, L (multiple)                       │
│ ├─ Price: 50-200€                              │
│ ├─ On Sale: Yes                                │
│ └─ Product Type: Shirts                         │
│                                                 │
│ JavaScript builds:                              │
│ const url = new URL('/api/products')            │
│ url.searchParams.append('colors', 'BLUE,RED')   │
│ url.searchParams.append('filterSizes', 'M,L')   │
│ url.searchParams.append('minPrice', 50)         │
│ url.searchParams.append('maxPrice', 200)        │
│ url.searchParams.append('onSale', true)         │
│ url.searchParams.append('productTypeId', 1)     │
│                                                 │
│ Final URL:                                      │
│ GET /api/products?colors=BLUE,RED&filterSizes=M,L&
│     minPrice=50&maxPrice=200&onSale=true&
│     productTypeId=1
└─────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────┐
│ STEP 2: NETWORK LAYER (HTTP)                    │
├─────────────────────────────────────────────────┤
│ Browser sends GET request to server             │
│ with query parameters in URL                    │
└─────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────┐
│ STEP 3: SPRING CONTROLLER ReceivESS REQUEST     │
├─────────────────────────────────────────────────┤
│ ProductController.getAllProducts() called       │
│                                                 │
│ Spring auto-conversion:                         │
│ colors=BLUE,RED  →  List<Color>[BLUE, RED]    │
│ filterSizes=M,L  →  List<Size>[M, L]          │
│ minPrice=50      →  BigDecimal(50)             │
│ maxPrice=200     →  BigDecimal(200)            │
│ onSale=true      →  Boolean.TRUE               │
│ productTypeId=1  →  Long(1)                    │
└─────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────┐
│ STEP 4: SERVICE LAYER PROCESSES                 │
├─────────────────────────────────────────────────┤
│ productService.getFilteredProducts(             │
│   minPrice: 50                                  │
│   maxPrice: 200                                 │
│   colors: [BLUE, RED]                           │
│   sizes: [M, L]                                 │
│   onSale: true                                  │
│   productTypeId: 1                              │
│   ... other params null                         │
│ )                                               │
│                                                 │
│ Service calls:                                  │
│ productRepository.findByFilters(...)            │
└─────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────┐
│ STEP 5: REPOSITORY CALLS DATABASE               │
├─────────────────────────────────────────────────┤
│ Hibernate translates JPA Query to SQL:          │
└─────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────┐
│ STEP 6: SQL QUERY EXECUTION                     │
├─────────────────────────────────────────────────┤
│                                                 │
│ SELECT DISTINCT p.* FROM products p             │
│ JOIN product_variants v ON p.id = v.product_id  │
│ WHERE (50 IS NULL OR p.price >= 50)             │
│   AND (200 IS NULL OR p.price <= 200)           │
│   AND (size([BLUE,RED]) = 0 OR v.color IN      │
│        ('BLUE','RED'))                          │
│   AND (size([M,L]) = 0 OR v.size IN ('M','L')) │
│   AND (p.dress_style IS NULL OR ...)            │
│   AND (true = false OR p.discount_percent > 0)  │
│   AND (false = false OR ...)                    │
│   AND (p.product_type_id = 1)                   │
│ LIMIT 20 OFFSET 0                               │
│                                                 │
│ Database evaluates:                             │
│ ✅ prices 50-200? YES                           │
│ ✅ colors BLUE/RED? YES                         │
│ ✅ sizes M or L? YES                            │
│ ✅ on sale (discount > 0)? YES                  │
│ ✅ type = Shirts? YES                           │
└─────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────┐
│ STEP 7: DATABASE RETURNS RESULTS                │
├─────────────────────────────────────────────────┤
│                                                 │
│ Matching Products:                              │
│ ├─ Product#5: Premium Blue Shirt                │
│ │  ├─ Price: 120€          ✅ (50-200)         │
│ │  ├─ Variants: BLUE-M, BLUE-L  ✅             │
│ │  ├─ Discount: 20%        ✅ (on sale)        │
│ │  └─ Type: Shirt (id=1)   ✅                  │
│ │                                               │
│ ├─ Product#8: Red Casual Shirt                  │
│ │  ├─ Price: 95€           ✅ (50-200)         │
│ │  ├─ Variants: RED-M, RED-L   ✅              │
│ │  ├─ Discount: 15%        ✅                  │
│ │  └─ Type: Shirt (id=1)   ✅                  │
│ │                                               │
│ └─ Product#12: Blue Formal Shirt                │
│    ├─ Price: 180€          ✅                  │
│    ├─ Variants: BLUE-M, BLUE-XL  ✅ (L match) │
│    ├─ Discount: 10%        ✅                  │
│    └─ Type: Shirt (id=1)   ✅                  │
│                                                 │
│ Total: 3 products found                         │
└─────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────┐
│ STEP 8: CONVERT TO DTO                          │
├─────────────────────────────────────────────────┤
│ Service.map(this::convertToResponse)            │
│                                                 │
│ Product#5 Entity →                              │
│ {                                               │
│   id: 5,                                        │
│   name: "Premium Blue Shirt",                   │
│   price: 120.00,                                │
│   originalPrice: 150.00,                        │
│   discountPercent: 20,                          │
│   variants: [                                   │
│     {id: 15, color: "BLUE", size: "M"...},     │
│     {id: 16, color: "BLUE", size: "L"...}      │
│   ]                                             │
│ }                                               │
│                                                 │
│ Same for Product#8, Product#12                  │
└─────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────┐
│ STEP 9: JSON RESPONSE                           │
├─────────────────────────────────────────────────┤
│ HTTP 200 OK                                     │
│ {                                               │
│   "content": [                                  │
│     { Product#5 DTO },                          │
│     { Product#8 DTO },                          │
│     { Product#12 DTO }                          │
│   ],                                            │
│   "totalElements": 3,                           │
│   "totalPages": 1,                              │
│   "number": 0,                                  │
│   "size": 20                                    │
│ }                                               │
└─────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────┐
│ STEP 10: BROWSER DISPLAYS                       │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌────────────────────────────────────────────┐ │
│ │ RESULTS (3 products found)                 │ │
│ ├────────────────────────────────────────────┤ │
│ │ 1. Premium Blue Shirt - 120€               │ │
│ │    🏷️ 20% OFF | BLUE, M/L | ⭐ 4.8        │ │
│ │    [ADD TO CART]                           │ │
│ │                                            │ │
│ │ 2. Red Casual Shirt - 95€                  │ │
│ │    🏷️ 15% OFF | RED, M/L | ⭐ 4.6        │ │
│ │    [ADD TO CART]                           │ │
│ │                                            │ │
│ │ 3. Blue Formal Shirt - 180€                │ │
│ │    🏷️ 10% OFF | BLUE, M/L | ⭐ 4.9       │ │
│ │    [ADD TO CART]                           │ │
│ └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## API Examples

### 1. Only Price Filter
```bash
GET /api/products?minPrice=50&maxPrice=200&page=0&size=20

# Returns: ALL products between 50-200€ (no other filters)
```

### 2. Multiple Colors & Sizes
```bash
GET /api/products?colors=BLUE,RED,BLACK&filterSizes=M,L,XL&page=0&size=20

# Returns: Products with (BLUE OR RED OR BLACK) AND (M OR L OR XL)
```

### 3. On Sale + Best Selling
```bash
GET /api/products?onSale=true&bestSelling=true&page=0&size=20

# Returns: Products that are BOTH on sale AND bestsellers (50+ reviews)
```

### 4. Specific Brand & Type
```bash
GET /api/products?brandId=1&productTypeId=2&page=0&size=20

# Returns: Only Calvin Klein (id=1) Jeans (id=2)
```

### 5. Category + All Filters Combined
```bash
GET /api/categories/1/products?
    minPrice=50&maxPrice=200&
    colors=BLUE,RED&filterSizes=M,L&
    dressStyle=CASUAL&
    onSale=true&
    bestSelling=true&
    brandId=1&
    productTypeId=2&
    page=0&size=20

# Returns: Category 1 products with ALL filters applied
```

---

## Database Queries

### Query 1: All Products with Filters

```sql
SELECT DISTINCT p.* 
FROM products p
JOIN product_variants v ON p.id = v.product_id
WHERE (50 IS NULL OR p.price >= 50)
  AND (200 IS NULL OR p.price <= 200)
  AND (array_length(ARRAY['BLUE'::text, 'RED'::text], 1) = 0 OR v.color IN ('BLUE', 'RED'))
  AND (array_length(ARRAY['M'::text, 'L'::text], 1) = 0 OR v.size IN ('M', 'L'))
  AND (NULL IS NULL OR p.dress_style = NULL)
  AND (false = false OR p.discount_percent > 0)
  AND (false = false OR p.review_count >= 50)
  AND (1 IS NULL OR p.brand_id = 1)
  AND (2 IS NULL OR p.product_type_id = 2)
LIMIT 20 OFFSET 0;
```

**Evaluation:**
```
(50 IS NULL → FALSE) OR p.price >= 50              ✅ prices >= 50
(200 IS NULL → FALSE) OR p.price <= 200            ✅ prices <= 200
(array_len = 0 → FALSE) OR v.color IN (...)        ✅ colors in list
(array_len = 0 → FALSE) OR v.size IN (...)         ✅ sizes in list
(NULL IS NULL → TRUE)                              ✅ ignored
(false = false → TRUE) OR ...                      ✅ ignored (discount check skipped)
(false = false → TRUE) OR ...                      ✅ ignored (review check skipped)
(1 IS NULL → FALSE) OR p.brand_id = 1              ✅ only brand 1
(2 IS NULL → FALSE) OR p.product_type_id = 2       ✅ only type 2
```

### Query 2: Category + Filters

```sql
SELECT DISTINCT p.* 
FROM products p
JOIN product_variants v ON p.id = v.product_id
WHERE p.category_id = 1
  AND (50 IS NULL OR p.price >= 50)
  AND (200 IS NULL OR p.price <= 200)
  AND (array_length(ARRAY['BLUE'::text, 'RED'::text], 1) = 0 OR v.color IN ('BLUE', 'RED'))
  -- ... other filters ...
LIMIT 20 OFFSET 0;
```

---

## Tests & Edge Cases

### Test 1: No Filters
```bash
GET /api/products?page=0&size=5

Expected: First 5 products (all)
All WHERE clauses become: :param IS NULL → TRUE (ignored)
```

### Test 2: Empty Lists
```bash
GET /api/products?colors=&filterSizes=&page=0&size=20

Expected: All colors and sizes
size([]) = 0 → TRUE (first part of OR) → filter ignored
```

### Test 3: Multiple Colors, No Sizes
```bash
GET /api/products?colors=BLUE,RED&page=0&size=20

Expected: All products with BLUE OR RED, any size
colors: (BLUE,RED) → v.color IN ('BLUE','RED')  ✅
sizes: NULL → (TRUE) → skip                       ✅
```

### Test 4: Price Range Only
```bash
GET /api/products?minPrice=100&maxPrice=500&page=0&size=20

Expected: All products 100-500€
price logic applied, all others ignored
```

### Test 5: On Sale Filter
```bash
GET /api/products?onSale=true&page=0&size=20

Expected: Only products with discount_percent > 0
onSale=true → (:onSale = false → FALSE) OR p.discountPercent > 0
           → p.discountPercent > 0 ✅ (check discount)
```

### Test 6: Best Selling + On Sale
```bash
GET /api/products?onSale=true&bestSelling=true&page=0&size=20

Expected: intersection - products that are BOTH on sale AND have 50+ reviews
Both conditions must be true (AND logic)
```

### Test 7: Category + Filters
```bash
GET /api/categories/1/products?colors=BLUE&minPrice=50

Expected: Category 1 products that are BLUE and cost 50€+
findByCategoryAndFilters() adds: WHERE p.category_id = 1 first
```

---

## Summary Table

| Component | Purpose | Key Technology |
|-----------|---------|-----------------|
| **Controller** | Receive HTTP requests | @RestController, @RequestParam |
| **Service** | Business logic | @Service, method conversion |
| **Repository** | Database queries | @Query, JPA QL, Hibernator |
| **Database** | Store & filter data | PostgreSQL, indexes |
| **Frontend** | Building URLs | JavaScript URLSearchParams |

| Filter | Level | Type | Logic |
|--------|-------|------|-------|
| Price | Product | Range | `BETWEEN min AND max` |
| Color | Variant | List | `IN (:colors)` |
| Size | Variant | List | `IN (:sizes)` |
| Style | Product | Single | `= :style` |
| On Sale | Product | Boolean | `discount_percent > 0` |
| Best Seller | Product | Boolean | `review_count >= 50` |
| Brand | Product | FK | `brand_id = :id` |
| Type | Product | FK | `product_type_id = :id` |
| Category | Product | FK (join endpoint) | `category_id = :id` |

---

## Performance Notes

✅ **Indexes Recommended:**
```sql
CREATE INDEX idx_product_price ON products(price);
CREATE INDEX idx_product_discount ON products(discount_percent);
CREATE INDEX idx_product_review ON products(review_count);
CREATE INDEX idx_variant_color ON product_variants(color);
CREATE INDEX idx_variant_size ON product_variants(size);
CREATE INDEX idx_product_category ON products(category_id);
```

✅ **Optimization Tips:**
- `SELECT DISTINCT` prevents duplicates from JOIN
- `Pageable` limits results (LIMIT 20 default)
- Lazy loading on variants (achieved through @OneToMany mapping)
- Consider caching for frequently filtered requests

---

**This is production-ready e-commerce filtering! 🎉**

