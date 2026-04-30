package com.ecommerce.server.dto;

public record CartItemResponse(
        Long id,
        Long variantId,
        String productName,
        String color,
        String size,
        Integer quantity,
        Double unitPrice,
        Double subtotal
) {}
