package com.ecommerce.server.dto.response;

public record CategoryResponse(
        Long id,
        String name,
        String description,
        String imageUrl,
        Integer productCount
) {}

