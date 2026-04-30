package com.ecommerce.server.dto.request;

public record UserRegistrationRequest(
        String email,
        String password,
        String firstName,
        String lastName,
        String phone
) {}

