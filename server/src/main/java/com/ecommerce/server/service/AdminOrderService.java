package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.OrderItemResponse;
import com.ecommerce.server.dto.response.OrderResponse;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.models.Order;
import com.ecommerce.server.models.OrderItem;
import com.ecommerce.server.models.ProductVariant;
import com.ecommerce.server.models.enums.OrderStatus;
import com.ecommerce.server.repository.OrderRepository;
import com.ecommerce.server.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;

    // Paginated για να μην φορτώνεται όλη η βάση orders σε ένα admin call —
    // ίδιο pattern με το ProductController.
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable) {
        Page<Order> orders = status != null
                ? orderRepository.findByStatus(status, pageable)
                : orderRepository.findAll(pageable);
        return orders.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        return toResponse(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found")));
    }

    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Stock restore όταν μια παραγγελία ακυρώνεται. Idempotent:
        // αν ήταν ήδη CANCELLED, δεν ξανα-επιστρέφουμε stock.
        // Αν το variant έχει διαγραφεί στο μεταξύ (variant == null),
        // skip — δεν υπάρχει stock counter για να ενημερωθεί.
        if (status == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            List<ProductVariant> toRestore = new ArrayList<>();
            for (OrderItem item : order.getItems()) {
                ProductVariant variant = item.getVariant();
                if (variant != null) {
                    variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                    toRestore.add(variant);
                }
            }
            if (!toRestore.isEmpty()) {
                productVariantRepository.saveAll(toRestore);
            }
        }

        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    // Ίδιο format με το OrderService — αλλιώς frontend που expect-άρει
    // "yyyy-MM-dd HH:mm:ss" σπάει στις admin views όπου το toString()
    // επέστρεφε ISO 8601 με 'T'.
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

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
                order.getCreatedAt().format(DATE_FORMATTER),
                items
        );
    }
}