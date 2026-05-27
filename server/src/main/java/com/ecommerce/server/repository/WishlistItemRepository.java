package com.ecommerce.server.repository;

import com.ecommerce.server.models.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    // Lista wishlist ενός user. Το toResponse του service καλεί
    // product.getName(), product.getPrice() και product.getBrand().getName() —
    // χωρίς JOIN FETCH θα είχαμε N+1 (1 query items + 1 query/item για product
    // + 1 query/item για brand). Με fetch, ένα SQL.
    @Query("""
        SELECT w FROM WishlistItem w
        JOIN FETCH w.product p
        JOIN FETCH p.brand
        WHERE w.user.id = :userId
        """)
    List<WishlistItem> findByUserId(@Param("userId") Long userId);

    Optional<WishlistItem> findByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserIdAndProductId(Long userId, Long productId);
}