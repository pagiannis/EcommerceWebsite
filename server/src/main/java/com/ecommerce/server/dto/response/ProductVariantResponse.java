package com.ecommerce.server.dto.response;

import java.math.BigDecimal;

public record ProductVariantResponse(
        Long id,
        String color,
        String size,
        Integer stockQuantity,
        String sku,
        BigDecimal price
) {}

