package com.ecommerce.server.dto.response;

public record SettingResponse(
        String key,
        String value,
        String description,
        String updatedAt
) {}
