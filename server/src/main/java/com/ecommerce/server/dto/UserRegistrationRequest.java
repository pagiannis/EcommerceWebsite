package com.ecommerce.server.dto;

public record UserRegistrationRequest(
        String email,
        String password,
        String firstName,
        String lastName,
        String phone
) {}
