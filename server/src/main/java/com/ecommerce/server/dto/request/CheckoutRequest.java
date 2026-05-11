package com.ecommerce.server.dto.request;

import com.ecommerce.server.models.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(
        @NotNull(message = "Shipping address ID is required")
        Long shippingAddressId,

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod
) {}