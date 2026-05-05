package com.ecommerce.server.dto.response;

public record ProductSuggestionResponse(
        Long id,
        String name,
        String imageUrl
) {}
