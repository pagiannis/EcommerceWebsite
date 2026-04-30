package com.ecommerce.server.dto.request;

public record AppReviewRequest(
        Integer rating,
        String comment
) {}

