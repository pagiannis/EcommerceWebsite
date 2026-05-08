package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.OrderItemResponse;
import com.ecommerce.server.dto.response.OrderResponse;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.models.Order;
import com.ecommerce.server.models.enums.OrderStatus;
import com.ecommerce.server.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private final OrderRepository orderRepository;

    public List<OrderResponse> getAllOrders(OrderStatus status) {
        List<Order> orders = status != null
                ? orderRepository.findByStatus(status)
                : orderRepository.findAll();
        return orders.stream().map(this::toResponse).toList();
    }

    public OrderResponse getOrderById(Long id) {
        return toResponse(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found")));
    }

    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProductName(),
                        item.getSelectedColor(),
                        item.getSelectedSize(),
                        item.getQuantity(),
                        item.getPriceAtPurchase(),
                        item.getSubtotal()
                )).toList();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus().toString(),
                order.getSubtotal(),
                order.getTax(),
                order.getShippingFee(),
                order.getTotal(),
                order.getCreatedAt().toString(),
                items
        );
    }
}