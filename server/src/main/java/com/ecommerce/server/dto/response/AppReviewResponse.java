package com.ecommerce.server.dto.response;

public record AppReviewResponse(
        Long id,
        String userName,
        Integer rating,
        String comment,
        String createdAt,
        Boolean approved,
        Boolean featured
) {}

