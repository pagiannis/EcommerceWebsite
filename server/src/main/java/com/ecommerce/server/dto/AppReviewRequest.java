package com.ecommerce.server.dto;

public record AppReviewRequest(
        Integer rating,
        String comment
) {}
