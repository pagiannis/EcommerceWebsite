package com.ecommerce.server.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CheckoutRequest(
        @NotNull(message = "Shipping address ID is required")
        Long shippingAddressId,

        @NotBlank(message = "Payment method is required")
        String paymentMethod,

        @NotEmpty(message = "Checkout items cannot be empty")
        @Valid
        List<CartItemRequest> items
) {}
