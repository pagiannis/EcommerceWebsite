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

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    long countByCategoryId(Long categoryId);

    @Query("""
        SELECT DISTINCT p FROM Product p
        JOIN p.variants v
        WHERE (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (:filterByColors = false OR v.color IN (:colors))
          AND (:filterBySizes = false OR v.size IN (:sizes))
          AND (:dressStyle IS NULL OR p.dressStyle = :dressStyle)
          AND (:onSale = false OR p.discountPercent > 0)
          AND (:bestSelling = false OR p.reviewCount >= 50)
          AND (:brandId IS NULL OR p.brand.id = :brandId)
          AND (:productTypeId IS NULL OR p.productType.id = :productTypeId)
          AND (:minRating IS NULL OR p.rating >= :minRating)
    """)
    Page<Product> findByFilters(
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("colors") List<Color> colors,
            @Param("filterByColors") boolean filterByColors,
            @Param("sizes") List<Size> sizes,
            @Param("filterBySizes") boolean filterBySizes,
            @Param("dressStyle") DressStyle dressStyle,
            @Param("onSale") boolean onSale,
            @Param("bestSelling") boolean bestSelling,
            @Param("brandId") Long brandId,
            @Param("productTypeId") Long productTypeId,
            @Param("minRating") Double minRating,
            Pageable pageable
    );

    @Query("""
        SELECT DISTINCT p FROM Product p
        JOIN p.variants v
        WHERE p.category.id = :categoryId
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (:filterByColors = false OR v.color IN (:colors))
          AND (:filterBySizes = false OR v.size IN (:sizes))
          AND (:dressStyle IS NULL OR p.dressStyle = :dressStyle)
          AND (:onSale = false OR p.discountPercent > 0)
          AND (:bestSelling = false OR p.reviewCount >= 50)
          AND (:brandId IS NULL OR p.brand.id = :brandId)
          AND (:productTypeId IS NULL OR p.productType.id = :productTypeId)
          AND (:minRating IS NULL OR p.rating >= :minRating)
    """)
    Page<Product> findByCategoryAndFilters(
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("colors") List<Color> colors,
            @Param("filterByColors") boolean filterByColors,
            @Param("sizes") List<Size> sizes,
            @Param("filterBySizes") boolean filterBySizes,
            @Param("dressStyle") DressStyle dressStyle,
            @Param("onSale") boolean onSale,
            @Param("bestSelling") boolean bestSelling,
            @Param("brandId") Long brandId,
            @Param("productTypeId") Long productTypeId,
            @Param("minRating") Double minRating,
            Pageable pageable
    );
}
