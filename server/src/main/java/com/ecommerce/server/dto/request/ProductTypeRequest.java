package com.ecommerce.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductTypeRequest(
        @NotBlank(message = "Product type name is required")
        @Size(max = 100, message = "Product type name must not exceed 100 characters")
        String name
) {}
