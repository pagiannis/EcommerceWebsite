package com.ecommerce.server.dto.response;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phone,
        String role,
        String createdAt
) {}

