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
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ...existing code...

    @Query("""
        SELECT DISTINCT p FROM Product p
        JOIN p.variants v
        WHERE (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (:color IS NULL OR v.color = :color)
          AND (:size IS NULL OR v.size = :size)
          AND (:dressStyle IS NULL OR p.dressStyle = :dressStyle)
    """)
    Page<Product> findByFilters(
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("color") Color color,
            @Param("size") Size size,
            @Param("dressStyle") DressStyle dressStyle,
            Pageable pageable
    );

    @Query("""
        SELECT DISTINCT p FROM Product p
        JOIN p.variants v
        WHERE p.category.id = :categoryId
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (:color IS NULL OR v.color = :color)
          AND (:size IS NULL OR v.size = :size)
          AND (:dressStyle IS NULL OR p.dressStyle = :dressStyle)
    """)
    Page<Product> findByCategoryAndFilters(
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("color") Color color,
            @Param("size") Size size,
            @Param("dressStyle") DressStyle dressStyle,
            Pageable pageable
    );
}


