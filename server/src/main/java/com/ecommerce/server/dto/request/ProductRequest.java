package com.ecommerce.server.dto.request;

import com.ecommerce.server.models.enums.DressStyle;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "Product name is required")
        @Size(max = 255, message = "Product name must not exceed 255 characters")
        String name,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        @NotNull(message = "Category ID is required")
        Long categoryId,

        @NotNull(message = "Brand ID is required")
        Long brandId,

        @NotNull(message = "Product Type ID is required")
        Long productTypeId,

        @NotNull(message = "Dress style is required")
        DressStyle dressStyle,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        BigDecimal price,

        @DecimalMin(value = "0.01", message = "Original price must be greater than 0")
        BigDecimal originalPrice,

        @Min(value = 0, message = "Discount cannot be negative")
        @Max(value = 100, message = "Discount cannot exceed 100")
        Integer discountPercent
) {}
