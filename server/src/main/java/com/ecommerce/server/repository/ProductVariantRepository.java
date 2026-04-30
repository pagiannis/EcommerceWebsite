package com.ecommerce.server.repository;

import com.ecommerce.server.models.ProductVariant;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductId(Long productId);
    Optional<ProductVariant> findByProductIdAndColorAndSize(Long productId, Color color, Size size);
    Optional<ProductVariant> findBySku(String sku);
}

