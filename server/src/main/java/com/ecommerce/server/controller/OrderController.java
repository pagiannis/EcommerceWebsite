package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.CheckoutRequest;
import com.ecommerce.server.dto.response.OrderResponse;
import com.ecommerce.server.service.OrderService;
import com.ecommerce.server.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getUserOrders(@PathVariable Long userId) {
        userService.requireSelf(userId);
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderDetail(@PathVariable Long orderId) {
        orderService.requireOrderOwner(orderId);
        return ResponseEntity.ok(orderService.getOrderDetail(orderId));
    }

    @PostMapping("/user/{userId}/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @PathVariable Long userId,
            @Valid @RequestBody CheckoutRequest request) {
        userService.requireSelf(userId);
        return new ResponseEntity<>(
                orderService.createOrder(userId, request.shippingAddressId(), request.paymentMethod()),
                HttpStatus.CREATED);
    }

    @PostMapping("/{orderId}/reorder")
    public ResponseEntity<Map<String, Object>> reorder(@PathVariable Long orderId,
                                                       @RequestParam Long userId) {
        userService.requireSelf(userId);
        List<String> skipped = orderService.reorder(orderId, userId);
        return ResponseEntity.ok(Map.of(
                "message", "Items added to cart",
                "skipped", skipped
        ));
    }
}
