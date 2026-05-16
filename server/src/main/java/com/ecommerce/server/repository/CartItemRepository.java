package com.ecommerce.server.repository;

import com.ecommerce.server.models.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // Hot path — καλείται σε κάθε cart page load. Το convertToResponse του
    // service αγγίζει variant.getProduct().getName()/getPrice(), color, size.
    // Χωρίς JOIN FETCH θα είχαμε N+1 (1 για cart_items + 1/item για variant
    // + 1/item για product). Με fetch, ένα SQL για όλο το cart.
    @Query("""
        SELECT ci FROM CartItem ci
        JOIN FETCH ci.variant v
        JOIN FETCH v.product
        WHERE ci.user.id = :userId
        """)
    List<CartItem> findByUserId(@Param("userId") Long userId);

    Optional<CartItem> findByUserIdAndVariantId(Long userId, Long variantId);
    void deleteByUserId(Long userId); // για clear cart μετά το checkout

    long countByVariantId(Long variantId);
}