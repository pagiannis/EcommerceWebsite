package com.ecommerce.server.dto;

public record AppReviewResponse(
        Long id,
        String userName,
        Integer rating,
        String comment,
        String createdAt,
        Boolean isApproved,
        Boolean isFeatured
) {}
