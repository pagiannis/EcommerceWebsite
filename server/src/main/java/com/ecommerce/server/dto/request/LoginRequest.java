package com.ecommerce.server.dto.request;

public record LoginRequest(
        String email,
        String password
) {}
