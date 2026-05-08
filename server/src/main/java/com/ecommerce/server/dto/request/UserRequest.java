package com.ecommerce.server.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserRequest(
        @Email(message = "Invalid email format")
        String email,

        String firstName,

        String lastName,

        @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone number must be valid and contain 10 to 15 digits")
        String phone,

        @Size(min = 6, message = "Password must be at least 6 characters long")
        String password
) {}
