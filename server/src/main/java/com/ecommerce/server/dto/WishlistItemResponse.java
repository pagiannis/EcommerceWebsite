package com.ecommerce.server.dto;

public record WishlistItemResponse(
        Long id,
        Long productId,
        String productName,
        String imageUrl,
        String brand,
        Double price,
        String addedAt
) {}
