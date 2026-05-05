package com.ecommerce.server.dto.request;

import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public record ProductVariantRequest(
        @NotNull(message = "Color is required")
        Color color,

        @NotNull(message = "Size is required")
        Size size,

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock quantity cannot be negative")
        Integer stockQuantity,

        @NotBlank(message = "SKU is required")
        String sku
) {}
