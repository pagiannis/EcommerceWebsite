package com.ecommerce.server.dto.response;

public record ReviewResponse(
        Long id,
        Long productId,
        String userName,
        Integer rating,
        String comment,
        String createdAt
) {}

