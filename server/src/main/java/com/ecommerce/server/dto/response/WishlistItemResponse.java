package com.ecommerce.server.dto.response;

import java.math.BigDecimal;

public record WishlistItemResponse(
        Long id,
        Long productId,
        String productName,
        String imageUrl,
        String brand,
        BigDecimal price,
        // originalPrice και discountPercent είναι nullable — αν δεν υπάρχει
        // έκπτωση, έρχονται και τα δύο null. Frontend πρέπει να κάνει null
        // check πριν δείξει το diagonal price / sale badge (ίδιο pattern με
        // το shop card στο ProductResponse).
        BigDecimal originalPrice,
        Integer discountPercent,
        Double rating,
        String addedAt
) {}

