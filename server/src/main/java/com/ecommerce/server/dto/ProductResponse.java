package com.ecommerce.server.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        String description,
        String gender,
        String category,
        String brand,
        String productType,
        String dressStyle,
        BigDecimal price,
        BigDecimal originalPrice,
        Integer discountPercent,
        Double rating,
        Integer reviewCount,
        List<String> imageUrls,
        List<ProductVariantResponse> variants
) {}
