package com.ecommerce.server.dto.request;

import java.util.List;

public record CheckoutRequest(
        Long shippingAddressId,
        String paymentMethod,
        List<CartItemRequest> items
) {}

