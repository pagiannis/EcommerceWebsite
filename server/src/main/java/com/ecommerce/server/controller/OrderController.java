package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.CheckoutRequest;
import com.ecommerce.server.dto.response.OrderResponse;
import com.ecommerce.server.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/user/{userId}")
    @PreAuthorize("#userId == authentication.principal.id")
    public ResponseEntity<List<OrderResponse>> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("@orderService.isOrderOwner(#orderId)")
    public ResponseEntity<OrderResponse> getOrderDetail(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderDetail(orderId));
    }

    @PostMapping("/user/{userId}/checkout")
    @PreAuthorize("#userId == authentication.principal.id")
    public ResponseEntity<OrderResponse> checkout(
            @PathVariable Long userId,
            @Valid @RequestBody CheckoutRequest request) {
        return new ResponseEntity<>(
                orderService.createOrder(userId, request.shippingAddressId(), request.paymentMethod()),
                HttpStatus.CREATED);
    }

    @PostMapping("/{orderId}/reorder")
    @PreAuthorize("@orderService.isOrderOwner(#orderId) and #userId == authentication.principal.id")
    public ResponseEntity<Map<String, Object>> reorder(@PathVariable Long orderId,
                                                       @RequestParam Long userId) {
        List<String> skipped = orderService.reorder(orderId, userId);
        return ResponseEntity.ok(Map.of(
                "message", "Items added to cart",
                "skipped", skipped
        ));
    }
}
