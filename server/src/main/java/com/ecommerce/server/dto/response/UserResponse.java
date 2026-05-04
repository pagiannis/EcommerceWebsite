package com.ecommerce.server.dto.response;

import com.ecommerce.server.models.enums.Role;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phone,
        Role role,
        LocalDateTime createdAt
) {}

