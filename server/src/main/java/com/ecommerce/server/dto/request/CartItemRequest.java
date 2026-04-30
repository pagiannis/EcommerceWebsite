package com.ecommerce.server.dto.request;

public record CartItemRequest(
        Long variantId,
        Integer quantity
) {}

