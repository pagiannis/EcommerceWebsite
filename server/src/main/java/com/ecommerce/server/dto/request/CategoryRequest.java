package com.ecommerce.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

public record CategoryRequest(
        @NotBlank(message = "Category name is required")
        @Size(max = 255, message = "Category name is too long")
        String name,
        
        @Size(max = 1000, message = "Description is too long")
        String description,
        
        @URL(message = "Image URL must be a valid URL")
        String imageUrl
) {}
