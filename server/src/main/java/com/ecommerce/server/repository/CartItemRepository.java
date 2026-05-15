package com.ecommerce.server.repository;

import com.ecommerce.server.models.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
    Optional<CartItem> findByUserIdAndVariantId(Long userId, Long variantId);
    void deleteByUserId(Long userId); // για clear cart μετά το checkout

    long countByVariantId(Long variantId);
}