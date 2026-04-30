package com.ecommerce.server.repository;

import com.ecommerce.server.models.Product;
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

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    // Για search με autocomplete
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Για φίλτρα
    Page<Product> findByPriceBetween(BigDecimal min, BigDecimal max, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId " +
            "AND p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByCategoryAndPriceRange(
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);
}


