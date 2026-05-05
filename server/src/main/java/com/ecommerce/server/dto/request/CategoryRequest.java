package com.ecommerce.server.dto.request;

public record CategoryRequest(
        String name,
        String description,
        String imageUrl
) {}