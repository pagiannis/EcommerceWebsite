package com.ecommerce.server.dto.response;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long variantId,
        String productName,
        String color,
        String size,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {}

