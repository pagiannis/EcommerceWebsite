package com.ecommerce.server.dto;

public record ReviewRequest(
        Long productId,
        Integer rating,
        String comment
) {}
