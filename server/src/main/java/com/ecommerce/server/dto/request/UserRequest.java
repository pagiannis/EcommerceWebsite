package com.ecommerce.server.dto.request;

public record UserRequest(
        String email,
        String firstName,
        String lastName,
        String phone,
        String password
) {}

