package com.ecommerce.server.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        String status,
        BigDecimal subtotal,
        BigDecimal tax,
        BigDecimal shippingFee,
        BigDecimal total,
        String createdAt,
        List<OrderItemResponse> items
) {}

