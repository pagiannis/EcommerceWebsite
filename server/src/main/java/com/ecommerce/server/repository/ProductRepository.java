package com.ecommerce.server.repository;

import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.DressStyle;
import com.ecommerce.server.models.enums.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ...existing code...

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


