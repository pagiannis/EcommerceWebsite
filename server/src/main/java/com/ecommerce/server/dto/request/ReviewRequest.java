package com.ecommerce.server.dto.request;

public record ReviewRequest(
        Long productId,
        Integer rating,
        String comment
) {}

