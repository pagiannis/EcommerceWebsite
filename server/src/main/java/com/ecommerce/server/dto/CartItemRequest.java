package com.ecommerce.server.dto;

import java.math.BigDecimal;

public record CartItemRequest(
        Long variantId,
        Integer quantity
) {}
