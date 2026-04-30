package com.ecommerce.server.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        String productName,
        String color,
        String size,
        Integer quantity,
        BigDecimal priceAtPurchase,
        BigDecimal subtotal
) {}
