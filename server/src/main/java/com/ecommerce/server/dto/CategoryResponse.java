package com.ecommerce.server.dto;

import java.util.List;

public record CategoryResponse(
        Long id,
        String name,
        String description,
        String imageUrl,
        Integer productCount
) {}
