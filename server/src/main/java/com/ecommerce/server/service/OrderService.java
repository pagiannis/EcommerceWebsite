package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.OrderResponse;
import com.ecommerce.server.dto.response.OrderItemResponse;
import com.ecommerce.server.models.*;
import com.ecommerce.server.models.enums.OrderStatus;
import com.ecommerce.server.models.enums.PaymentMethod;
import com.ecommerce.server.exception.BadRequestException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.*;
import com.ecommerce.server.security.AuthUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    // Fallbacks αν τα settings στη βάση λείπουν (π.χ. fresh deploy χωρίς seed).
    // Το checkout δεν πρέπει ποτέ να σπάσει επειδή ο admin ξέχασε να σώσει tax rate.
    private static final BigDecimal DEFAULT_TAX_RATE = new BigDecimal("0.10");      // 10% VAT
    private static final BigDecimal DEFAULT_SHIPPING_FEE = new BigDecimal("5.00");  // $5

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final SettingService settingService;

    public OrderService(OrderRepository orderRepository,
                       OrderItemRepository orderItemRepository,
                       CartItemRepository cartItemRepository,
                       ProductVariantRepository productVariantRepository,
                       UserRepository userRepository,
                       AddressRepository addressRepository,
                       SettingService settingService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.productVariantRepository = productVariantRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.settingService = settingService;
    }

    /**
     * Λήψη παραγγελιών χρήστη
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Λήψη λεπτομερειών παραγγελίας
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toResponse(order);
    }

    /**
     * Δημιουργία νέας παραγγελίας (CHECKOUT)
     * Snapshot pattern - αποθηκεύουμε τα δεδομένα που ήταν τότε
     */
    @Transactional
    public OrderResponse createOrder(Long userId, Long shippingAddressId, PaymentMethod paymentMethod) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Address shippingAddress = addressRepository.findById(shippingAddressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        // Η διεύθυνση πρέπει να ανήκει στον ίδιο τον user — αλλιώς ο attacker θα
        // μπορούσε να στείλει αντικείμενα σε διεύθυνση τρίτου.
        if (!shippingAddress.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Address does not belong to user");
        }

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Validate stock ΠΡΩΤΑ για όλα τα cart items πριν αγγίξουμε τη βάση.
        // Αν αποτύχει, δεν έχει γίνει κανένα write — άρα δεν χρειαζόμαστε
        // transactional rollback για ξεγραμμένο Order.
        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getVariant();
            if (cartItem.getQuantity() > variant.getStockQuantity()) {
                Product product = variant.getProduct();
                throw new BadRequestException(
                        "Not enough stock for " + product.getName() +
                                " (" + variant.getColor() + "/" + variant.getSize() + "). " +
                                "Available: " + variant.getStockQuantity() +
                                ", Requested: " + cartItem.getQuantity()
                );
            }
        }

        // Tax rate και shipping fee διαβάζονται από τα app_settings ώστε ο
        // admin να μπορεί να τα αλλάξει χωρίς redeploy. Fallbacks αν λείπουν.
        BigDecimal taxRate = settingService.getDecimal(SettingService.TAX_RATE_KEY, DEFAULT_TAX_RATE);
        BigDecimal shippingFeeValue = settingService.getDecimal(SettingService.SHIPPING_FEE_KEY, DEFAULT_SHIPPING_FEE);

        // Όλοι οι υπολογισμοί στρογγυλοποιούνται σε 2 δεκαδικά με HALF_UP.
        // Αλλιώς το API θα μπορούσε να επιστρέψει 26.989000000000002 ή
        // ασυνέπεια με τη βάση που έχει column scale=2 (Hibernate auto-rounds
        // με banker's rounding που είναι confusing για financial data).
        BigDecimal subtotal = cartItems.stream()
                .map(item -> item.getVariant().getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal tax = subtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal shippingFee = shippingFeeValue.setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax).add(shippingFee)
                .setScale(2, RoundingMode.HALF_UP);

        // Order number με UUID για collision-free generation σε concurrent requests.
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
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

        List<OrderItem> orderItems = new ArrayList<>(cartItems.size());
        List<ProductVariant> variantsToUpdate = new ArrayList<>(cartItems.size());

        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getVariant();
            Product product = variant.getProduct();

            orderItems.add(OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .variant(variant)
                    .productName(product.getName())
                    .priceAtPurchase(product.getPrice())
                    .selectedColor(variant.getColor().toString())
                    .selectedSize(variant.getSize().toString())
                    .quantity(cartItem.getQuantity())
                    .subtotal(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build());

            variant.setStockQuantity(variant.getStockQuantity() - cartItem.getQuantity());
            variantsToUpdate.add(variant);
        }

        orderItemRepository.saveAll(orderItems);
        productVariantRepository.saveAll(variantsToUpdate);

        cartItemRepository.deleteByUserId(userId);

        savedOrder.setItems(orderItems);

        return toResponse(savedOrder);
    }

    /**
     * Επανάληψη παλιάς παραγγελίας — προσθέτει τα items στο καλάθι.
     * Ο controller επιβάλλει ήδη ownership μέσω @PreAuthorize, αλλά κρατάμε
     * service-level guard για defense in depth: αν η μέθοδος κληθεί από
     * άλλο σημείο (scheduler, admin endpoint, future caller) με userId
     * διαφορετικό από τον owner του order, αρνούμαστε αντί να βάλουμε
     * σιωπηρά τα items στο λάθος cart. Ίδιο pattern με την createOrder
     * για το shippingAddress.
     */
    @Transactional
    public List<String> reorder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Order does not belong to user");
        }

        List<String> skipped = new java.util.ArrayList<>();

        for (OrderItem item : order.getItems()) {
            if (item.getVariant() == null) {
                skipped.add(item.getProductName() + " (variant no longer exists)");
                continue;
            }
            int available = item.getVariant().getStockQuantity();
            if (available <= 0) {
                skipped.add(item.getProductName() + " (out of stock)");
                continue;
            }
            int quantity = Math.min(item.getQuantity(), available);
            // Τα expected fail cases (variant null, out of stock) πιάνονται πριν το save.
            // Αν σπάσει το save παρ' όλα αυτά, αφήνουμε το exception να γίνει propagate
            // ώστε το transaction να κάνει rollback — ένα catch εδώ θα οδηγούσε σε
            // UnexpectedRollbackException στο commit.
            var existingOpt = cartItemRepository.findByUserIdAndVariantId(userId, item.getVariant().getId());
            if (existingOpt.isPresent()) {
                CartItem existing = existingOpt.get();
                // Αν η υπάρχουσα ποσότητα ήδη φτάνει/ξεπερνά το διαθέσιμο, το
                // reorder ΔΕΝ μειώνει σιωπηρά — απλά skip το item. Συνέπεια
                // με τον γενικό κανόνα του cart: ποτέ δεν χάνεις ποσότητα
                // χωρίς ρητή ενέργεια του χρήστη.
                if (existing.getQuantity() >= available) {
                    skipped.add(item.getProductName() + " (already at max in cart)");
                    continue;
                }
                int newQuantity = Math.min(existing.getQuantity() + quantity, available);
                existing.setQuantity(newQuantity);
                cartItemRepository.save(existing);
            } else {
                cartItemRepository.save(
                        com.ecommerce.server.models.CartItem.builder()
                                .user(order.getUser())
                                .variant(item.getVariant())
                                .quantity(quantity)
                                .build()
                );
            }
        }
        return skipped;
    }

    // Ownership check για χρήση από @PreAuthorize SpEL:
    //   @PreAuthorize("@orderService.isOrderOwner(#orderId)")
    @Transactional(readOnly = true)
    public boolean isOrderOwner(Long orderId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthUser user)) {
            return false;
        }
        return orderRepository.findById(orderId)
                .map(o -> o.getUser().getId().equals(user.getId()))
                .orElse(false);
    }

    /**
     * Ενημέρωση κατάστασης παραγγελίας (admin)
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    /**
     * Λήψη παραγγελιών κατά κατάσταση
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Μετατροπή Order Entity σε OrderResponse DTO
     */
    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::toOrderItemResponse)
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
    private OrderItemResponse toOrderItemResponse(OrderItem item) {
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

