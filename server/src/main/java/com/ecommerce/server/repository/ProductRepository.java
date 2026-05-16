package com.ecommerce.server.repository;

import com.ecommerce.server.dto.response.ProductSuggestionResponse;
import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.DressStyle;
import com.ecommerce.server.models.enums.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Autocomplete projection: επιστρέφει απευθείας DTOs (id, name, firstImageUrl)
    // χωρίς να φορτώνει Product/ProductImage entities. Το imageUrl παίρνεται
    // με scalar subquery που γυρίζει μόνο την πρώτη εικόνα (displayOrder ASC),
    // αποφεύγοντας το N+1 / batch fetch που είχε η παλιά υλοποίηση.
    @Query("""
        SELECT new com.ecommerce.server.dto.response.ProductSuggestionResponse(
            p.id,
            p.name,
            (SELECT pi.imageUrl FROM ProductImage pi
                WHERE pi.product = p
                ORDER BY pi.displayOrder ASC
                LIMIT 1)
        )
        FROM Product p
        WHERE LOWER(p.name) LIKE LOWER(CONCAT(:query, '%'))
           OR LOWER(p.name) LIKE LOWER(CONCAT('% ', :query, '%'))
        """)
    List<ProductSuggestionResponse> findTop8SuggestionsByWordPrefix(@Param("query") String query, Pageable pageable);

    long countByCategoryId(Long categoryId);

    long countByBrandId(Long brandId);

    long countByProductTypeId(Long productTypeId);

    // Atomic recalculation από τη βάση — αποφεύγει race condition που είχε
    // το παλιό pattern "fetch product → set field → save". Το UPDATE παίρνει
    // row lock στο product, οπότε δύο concurrent reviews σειριοποιούνται:
    // το 2ο UPDATE βλέπει το committed insert του 1ου και υπολογίζει σωστά.
    // ROUND(AVG(...) * 10) / 10.0 = ίδια στρογγυλοποίηση με Math.round στον DataInitializer.
    //
    // flushAutomatically=true: το pending INSERT review από το service ΠΡΕΠΕΙ να
    //   φτάσει στη βάση πριν τρέξει αυτό το UPDATE, αλλιώς το COUNT/AVG το αγνοεί.
    // clearAutomatically=true: ο επόμενος findById(product) θα ξαναδιαβάσει από
    //   τη βάση αντί να επιστρέψει stale entity από τον persistence context.
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
        UPDATE Product p
        SET p.rating = COALESCE(
                (SELECT ROUND(AVG(r.rating) * 10) / 10.0 FROM Review r WHERE r.product = p),
                0.0
            ),
            p.reviewCount = (SELECT COUNT(r) FROM Review r WHERE r.product = p),
            p.updatedAt = CURRENT_TIMESTAMP
        WHERE p.id = :productId
        """)
    void recalculateRatingAndCount(@Param("productId") Long productId);

    // ΜΟΝΟ για DataInitializer — φέρνει variants eagerly ώστε να μην κλείσει η session πριν τα χρειαστούμε
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.variants")
    List<Product> findAllWithVariants();

    // topSelling=true: ταξινόμηση βάσει πωλήσεων — χρησιμοποιεί EXISTS για variants ώστε να μην
    // πολλαπλασιαστεί το SUM(quantity) λόγω JOIN
    @Query(value = """
        SELECT p FROM Product p
        JOIN p.brand b
        JOIN p.productType pt
        LEFT JOIN OrderItem oi ON oi.product = p
        WHERE (:categoryName IS NULL OR LOWER(p.category.name) = :categoryName)
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (:filterByColors = false OR EXISTS (SELECT 1 FROM ProductVariant v WHERE v.product = p AND v.color IN (:colors)))
          AND (:filterBySizes = false OR EXISTS (SELECT 1 FROM ProductVariant v WHERE v.product = p AND v.size IN (:sizes)))
          AND (:dressStyle IS NULL OR p.dressStyle = :dressStyle)
          AND (:onSale = false OR p.discountPercent > 0)
          AND (:bestSelling = false OR p.reviewCount >= 50)
          AND (:brandName IS NULL OR LOWER(b.name) = :brandName)
          AND (:productTypeName IS NULL OR LOWER(pt.name) = :productTypeName)
          AND (:minRating IS NULL OR p.rating >= :minRating)
        GROUP BY p
        ORDER BY COALESCE(SUM(oi.quantity), 0) DESC
        """,
        countQuery = """
        SELECT COUNT(DISTINCT p) FROM Product p
        JOIN p.brand b
        JOIN p.productType pt
        WHERE (:categoryName IS NULL OR LOWER(p.category.name) = :categoryName)
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (:filterByColors = false OR EXISTS (SELECT 1 FROM ProductVariant v WHERE v.product = p AND v.color IN (:colors)))
          AND (:filterBySizes = false OR EXISTS (SELECT 1 FROM ProductVariant v WHERE v.product = p AND v.size IN (:sizes)))
          AND (:dressStyle IS NULL OR p.dressStyle = :dressStyle)
          AND (:onSale = false OR p.discountPercent > 0)
          AND (:bestSelling = false OR p.reviewCount >= 50)
          AND (:brandName IS NULL OR LOWER(b.name) = :brandName)
          AND (:productTypeName IS NULL OR LOWER(pt.name) = :productTypeName)
          AND (:minRating IS NULL OR p.rating >= :minRating)
        """)
    Page<Product> findTopSellingProducts(
            @Param("categoryName") String categoryName,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("colors") List<Color> colors,
            @Param("filterByColors") boolean filterByColors,
            @Param("sizes") List<Size> sizes,
            @Param("filterBySizes") boolean filterBySizes,
            @Param("dressStyle") DressStyle dressStyle,
            @Param("onSale") boolean onSale,
            @Param("bestSelling") boolean bestSelling,
            @Param("brandName") String brandName,
            @Param("productTypeName") String productTypeName,
            @Param("minRating") Double minRating,
            Pageable pageable);

    @Query(value = """
        SELECT DISTINCT p FROM Product p
        JOIN p.variants v
        JOIN p.brand b
        JOIN p.productType pt
        WHERE (:categoryName IS NULL OR LOWER(p.category.name) = :categoryName)
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (:filterByColors = false OR v.color IN (:colors))
          AND (:filterBySizes = false OR v.size IN (:sizes))
          AND (:dressStyle IS NULL OR p.dressStyle = :dressStyle)
          AND (:onSale = false OR p.discountPercent > 0)
          AND (:bestSelling = false OR p.reviewCount >= 50)
          AND (:brandName IS NULL OR LOWER(b.name) = :brandName)
          AND (:productTypeName IS NULL OR LOWER(pt.name) = :productTypeName)
          AND (:minRating IS NULL OR p.rating >= :minRating)
        """,
        countQuery = """
        SELECT COUNT(DISTINCT p) FROM Product p
        JOIN p.variants v
        JOIN p.brand b
        JOIN p.productType pt
        WHERE (:categoryName IS NULL OR LOWER(p.category.name) = :categoryName)
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (:filterByColors = false OR v.color IN (:colors))
          AND (:filterBySizes = false OR v.size IN (:sizes))
          AND (:dressStyle IS NULL OR p.dressStyle = :dressStyle)
          AND (:onSale = false OR p.discountPercent > 0)
          AND (:bestSelling = false OR p.reviewCount >= 50)
          AND (:brandName IS NULL OR LOWER(b.name) = :brandName)
          AND (:productTypeName IS NULL OR LOWER(pt.name) = :productTypeName)
          AND (:minRating IS NULL OR p.rating >= :minRating)
        """)
    Page<Product> findByFilters(
            @Param("categoryName") String categoryName,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("colors") List<Color> colors,
            @Param("filterByColors") boolean filterByColors,
            @Param("sizes") List<Size> sizes,
            @Param("filterBySizes") boolean filterBySizes,
            @Param("dressStyle") DressStyle dressStyle,
            @Param("onSale") boolean onSale,
            @Param("bestSelling") boolean bestSelling,
            @Param("brandName") String brandName,
            @Param("productTypeName") String productTypeName,
            @Param("minRating") Double minRating,
            Pageable pageable
    );
}