package com.ecommerce.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SettingRequest(
        @NotBlank(message = "Value is required")
        @Size(max = 500, message = "Value must not exceed 500 characters")
        String value,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description
) {}
