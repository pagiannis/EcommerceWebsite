package com.ecommerce.server.dto.response;

import java.math.BigDecimal;

public record WishlistItemResponse(
        Long id,
        Long productId,
        String productName,
        String imageUrl,
        String brand,
        BigDecimal price,
        String addedAt
) {}

