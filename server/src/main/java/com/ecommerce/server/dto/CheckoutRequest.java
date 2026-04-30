package com.ecommerce.server.dto;

import java.math.BigDecimal;
import java.util.List;

public record CheckoutRequest(
        Long shippingAddressId,
        String paymentMethod,
        List<CartItemRequest> items
) {}
