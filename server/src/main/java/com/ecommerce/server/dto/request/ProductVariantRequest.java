package com.ecommerce.server.dto.request;

import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.Size;

public record ProductVariantRequest(
        Color color,
        Size size,
        Integer stockQuantity,
        String sku
) {}