package com.ecommerce.server.dto.request;

import com.ecommerce.server.models.enums.DressStyle;
import java.math.BigDecimal;

public record ProductRequest(
        String name,
        String description,
        Long categoryId,
        Long brandId,
        Long productTypeId,
        DressStyle dressStyle,
        BigDecimal price,
        BigDecimal originalPrice,
        Integer discountPercent
) {}