package com.ecommerce.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

public record BrandRequest(
        @NotBlank(message = "Brand name is required")
        @Size(max = 255, message = "Brand name must not exceed 255 characters")
        String name,
        
        @URL(message = "Logo URL must be a valid URL")
        String logoUrl
) {}
