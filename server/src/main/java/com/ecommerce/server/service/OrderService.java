package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.OrderResponse;
import com.ecommerce.server.dto.response.OrderItemResponse;
import com.ecommerce.server.models.*;
import com.ecommerce.server.models.enums.OrderStatus;
import com.ecommerce.server.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public OrderService(OrderRepository orderRepository,
                       OrderItemRepository orderItemRepository,
                       CartItemRepository cartItemRepository,
                       ProductVariantRepository productVariantRepository,
                       UserRepository userRepository,
                       AddressRepository addressRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.productVariantRepository = productVariantRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    /**
     * Λήψη παραγγελιών χρήστη
     */
    public List<OrderResponse> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Λήψη λεπτομερειών παραγγελίας
     */
    public OrderResponse getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToResponse(order);
    }

    /**
     * Δημιουργία νέας παραγγελίας (CHECKOUT)
     * ⭐ CRITICAL: Snapshot pattern - αποθηκεύουμε τα δεδομένα που ήταν τότε
     */
    @Transactional
    public OrderResponse createOrder(Long userId, Long shippingAddressId, String paymentMethod) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Address shippingAddress = addressRepository.findById(shippingAddressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Λήψη άδεώ καλαθιού
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Υπολογισμός τιμών
        BigDecimal subtotal = cartItems.stream()
                .map(item -> item.getVariant().getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.10)); // 10% VAT
        BigDecimal shippingFee = BigDecimal.valueOf(5.00);
        BigDecimal total = subtotal.add(tax).add(shippingFee);

        // Δημιουργία Order
        String orderNumber = "ORD-" + System.currentTimeMillis();
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .tax(tax)
                .shippingFee(shippingFee)
                .total(total)
                .shippingAddress(shippingAddress)
                .paymentMethod(paymentMethod)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Δημιουργία OrderItems (SNAPSHOTS - αποθηκεύουμε τι ήταν τότε)
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getVariant().getProduct();
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .variant(cartItem.getVariant())
                    .productName(product.getName())           // SNAPSHOT
                    .priceAtPurchase(product.getPrice())      // SNAPSHOT - τιμή τώρα
                    .selectedColor(cartItem.getVariant().getColor().toString())  // SNAPSHOT
                    .selectedSize(cartItem.getVariant().getSize().toString())    // SNAPSHOT
                    .quantity(cartItem.getQuantity())
                    .subtotal(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build();

            orderItemRepository.save(orderItem);

            // Ενημέρωση stock (μείωση)
            ProductVariant variant = cartItem.getVariant();
            variant.setStockQuantity(variant.getStockQuantity() - cartItem.getQuantity());
            productVariantRepository.save(variant);
        }

        // Αποκαθάρισή καλαθιού
        cartItemRepository.deleteByUserId(userId);

        return convertToResponse(savedOrder);
    }

    /**
     * Ενημέρωση κατάστασης παραγγελίας (admin)
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(newStatus);
        return convertToResponse(orderRepository.save(order));
    }

    /**
     * Λήψη παραγγελιών κατά κατάσταση
     */
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Μετατροπή Order Entity σε OrderResponse DTO
     */
    private OrderResponse convertToResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::convertOrderItemToResponse)
                .collect(Collectors.toList());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String createdAt = order.getCreatedAt().format(formatter);

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus().toString(),
                order.getSubtotal(),
                order.getTax(),
                order.getShippingFee(),
                order.getTotal(),
                createdAt,
                items
        );
    }

    // Μετατροπή OrderItem σε OrderItemResponse
    private OrderItemResponse convertOrderItemToResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getProductName(),
                item.getSelectedColor(),
                item.getSelectedSize(),
                item.getQuantity(),
                item.getPriceAtPurchase(),
                item.getSubtotal()
        );
    }
}

