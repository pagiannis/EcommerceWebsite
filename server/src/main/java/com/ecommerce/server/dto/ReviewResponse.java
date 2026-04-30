package com.ecommerce.server.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long productId,
        String userName,
        Integer rating,
        String comment,
        String createdAt
) {}
