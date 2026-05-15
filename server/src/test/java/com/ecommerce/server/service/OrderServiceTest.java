package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.OrderResponse;
import com.ecommerce.server.exception.BadRequestException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.models.*;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.OrderStatus;
import com.ecommerce.server.models.enums.PaymentMethod;
import com.ecommerce.server.models.enums.Size;
import com.ecommerce.server.repository.*;
import com.ecommerce.server.security.AuthUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests για το OrderService.
 *
 * Κύριο focus: η createOrder() (checkout) — έχει την πιο σύνθετη business logic
 * του project (calculations, stock validation, snapshot pattern, cart cleanup).
 *
 * Επαναλαμβάνουμε patterns που μάθαμε:
 *  - Mockito @Mock / @InjectMocks
 *  - SecurityContextHolder setup/teardown για ownership tests
 *  - ArgumentCaptor για επιβεβαίωση mutated state
 *  - assertThatThrownBy για exception checks
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    private static final Long OWNER_ID = 1L;
    private static final String OWNER_EMAIL = "owner@test.com";
    private static final Long OTHER_USER_ID = 2L;

    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductVariantRepository productVariantRepository;
    @Mock private UserRepository userRepository;
    @Mock private AddressRepository addressRepository;

    @InjectMocks
    private OrderService orderService;

    private User owner;
    private Address ownerAddress;
    private Product product;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(OWNER_ID).email(OWNER_EMAIL).build();

        ownerAddress = Address.builder()
                .id(10L)
                .user(owner)
                .street("Patision 1").city("Athens").postalCode("11111").country("GR")
                .build();

        product = Product.builder()
                .id(100L)
                .name("Black T-shirt")
                .price(new BigDecimal("20.00"))
                .build();

        variant = ProductVariant.builder()
                .id(1000L)
                .product(product)
                .color(Color.BLACK).size(Size.M)
                .stockQuantity(10)
                .build();

        // SecurityContext setup για τα isOrderOwner tests.
        // Δεν χρειάζεται για createOrder (παίρνει userId σαν parameter).
        AuthUser principal = new AuthUser(OWNER_ID, OWNER_EMAIL, "HASH", List.of());
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, "HASH", List.of());
        SecurityContextHolder.setContext(new SecurityContextImpl(auth));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private CartItem cartItem(int quantity) {
        return CartItem.builder()
                .id(System.nanoTime()) // δεν μας ενδιαφέρει το exact id εδώ
                .user(owner)
                .variant(variant)
                .quantity(quantity)
                .build();
    }

    // ====================================================================
    //   createOrder — happy path
    // ====================================================================

    @Test
    @DisplayName("createOrder: happy path — σωστοί υπολογισμοί, snapshot, stock decrement, cart cleanup")
    void createOrder_happyPath_persistsOrderAndItemsAndDecrementsStock() {
        // ARRANGE — cart με 2 του ίδιου variant (price 20 * qty 2 = 40)
        CartItem item = cartItem(2);
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(addressRepository.findById(10L)).thenReturn(Optional.of(ownerAddress));
        when(cartItemRepository.findByUserId(OWNER_ID)).thenReturn(List.of(item));
        // Το save επιστρέφει το ίδιο order που του δίνουμε (id δεν είναι κρίσιμο εδώ)
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        // ACT
        OrderResponse response = orderService.createOrder(OWNER_ID, 10L, PaymentMethod.CARD);

        // ASSERT 1 — financial math: subtotal=40, tax=4 (10%), shipping=5, total=49
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(orderCaptor.capture());
        Order savedOrder = orderCaptor.getValue();

        assertThat(savedOrder.getSubtotal()).isEqualByComparingTo("40.00");
        assertThat(savedOrder.getTax()).isEqualByComparingTo("4.00");
        assertThat(savedOrder.getShippingFee()).isEqualByComparingTo("5.00");
        assertThat(savedOrder.getTotal()).isEqualByComparingTo("49.00");
        assertThat(savedOrder.getStatus()).isEqualTo(OrderStatus.PENDING);
        assertThat(savedOrder.getPaymentMethod()).isEqualTo(PaymentMethod.CARD);
        assertThat(savedOrder.getOrderNumber()).startsWith("ORD-");
        assertThat(savedOrder.getUser()).isEqualTo(owner);
        assertThat(savedOrder.getShippingAddress()).isEqualTo(ownerAddress);

        // ASSERT 2 — order item snapshot: name, price, color, size, quantity, subtotal
        ArgumentCaptor<List<OrderItem>> itemsCaptor = ArgumentCaptor.forClass(List.class);
        verify(orderItemRepository).saveAll(itemsCaptor.capture());
        List<OrderItem> savedItems = itemsCaptor.getValue();
        assertThat(savedItems).hasSize(1);
        OrderItem orderItem = savedItems.get(0);
        assertThat(orderItem.getProductName()).isEqualTo("Black T-shirt");
        assertThat(orderItem.getPriceAtPurchase()).isEqualByComparingTo("20.00");
        assertThat(orderItem.getSelectedColor()).isEqualTo("BLACK");
        assertThat(orderItem.getSelectedSize()).isEqualTo("M");
        assertThat(orderItem.getQuantity()).isEqualTo(2);
        assertThat(orderItem.getSubtotal()).isEqualByComparingTo("40.00");

        // ASSERT 3 — stock μειώθηκε από 10 σε 8
        ArgumentCaptor<List<ProductVariant>> variantsCaptor = ArgumentCaptor.forClass(List.class);
        verify(productVariantRepository).saveAll(variantsCaptor.capture());
        assertThat(variantsCaptor.getValue().get(0).getStockQuantity()).isEqualTo(8);

        // ASSERT 4 — το cart καθαρίστηκε
        verify(cartItemRepository).deleteByUserId(OWNER_ID);

        // ASSERT 5 — το response έχει σωστά αθροίσματα
        assertThat(response.total()).isEqualByComparingTo("49.00");
        assertThat(response.status()).isEqualTo("PENDING");
    }

    // ====================================================================
    //   createOrder — failure modes
    // ====================================================================

    @Test
    @DisplayName("createOrder: άγνωστος user → ResourceNotFoundException, ποτέ δεν φτάνει σε save")
    void createOrder_userNotFound_throws() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(OWNER_ID, 10L, PaymentMethod.CARD))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");

        verify(orderRepository, never()).save(any());
        verify(cartItemRepository, never()).deleteByUserId(any());
    }

    @Test
    @DisplayName("createOrder: άγνωστη διεύθυνση → ResourceNotFoundException")
    void createOrder_addressNotFound_throws() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(addressRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(OWNER_ID, 10L, PaymentMethod.CARD))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Address not found");
    }

    @Test
    @DisplayName("createOrder: διεύθυνση άλλου user → AccessDenied (security guard)")
    void createOrder_addressOfDifferentUser_throwsAccessDenied() {
        User other = User.builder().id(OTHER_USER_ID).email("other@x").build();
        Address foreignAddress = Address.builder().id(99L).user(other).build();

        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(addressRepository.findById(99L)).thenReturn(Optional.of(foreignAddress));

        assertThatThrownBy(() -> orderService.createOrder(OWNER_ID, 99L, PaymentMethod.CARD))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Address does not belong");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("createOrder: άδειο cart → BadRequestException")
    void createOrder_emptyCart_throws() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(addressRepository.findById(10L)).thenReturn(Optional.of(ownerAddress));
        when(cartItemRepository.findByUserId(OWNER_ID)).thenReturn(List.of());

        assertThatThrownBy(() -> orderService.createOrder(OWNER_ID, 10L, PaymentMethod.CARD))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cart is empty");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("createOrder: ποσότητα cart > stock → BadRequestException με όνομα, χρώμα, μέγεθος, διαθέσιμο")
    void createOrder_insufficientStock_throwsWithDetailedMessage() {
        // Cart ζητάει 15, stock=10
        CartItem item = cartItem(15);
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(addressRepository.findById(10L)).thenReturn(Optional.of(ownerAddress));
        when(cartItemRepository.findByUserId(OWNER_ID)).thenReturn(List.of(item));

        assertThatThrownBy(() -> orderService.createOrder(OWNER_ID, 10L, PaymentMethod.CARD))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Black T-shirt")
                .hasMessageContaining("BLACK")
                .hasMessageContaining("Available: 10")
                .hasMessageContaining("Requested: 15");

        // Stock validation γίνεται ΠΡΙΝ οποιοδήποτε write: ούτε Order γράφεται,
        // ούτε stock μειώνεται, ούτε καθαρίζει το cart. Όχι rollback overhead.
        verify(orderRepository, never()).save(any());
        verify(productVariantRepository, never()).saveAll(anyList());
        verify(orderItemRepository, never()).saveAll(anyList());
        verify(cartItemRepository, never()).deleteByUserId(any());
        assertThat(variant.getStockQuantity()).isEqualTo(10);
    }

    // ====================================================================
    //   reorder
    // ====================================================================

    @Test
    @DisplayName("reorder: variant null → προστίθεται στα skipped, δεν γίνεται save")
    void reorder_variantDeleted_skipped() {
        OrderItem orphan = OrderItem.builder()
                .productName("Deleted Product")
                .variant(null)
                .quantity(1)
                .build();
        Order order = Order.builder().id(1L).user(owner).items(List.of(orphan)).build();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        List<String> skipped = orderService.reorder(1L, OWNER_ID);

        assertThat(skipped).containsExactly("Deleted Product (variant no longer exists)");
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("reorder: variant out of stock → στα skipped")
    void reorder_outOfStock_skipped() {
        variant.setStockQuantity(0);
        OrderItem oi = OrderItem.builder()
                .productName("Black T-shirt").variant(variant).quantity(2).build();
        Order order = Order.builder().id(1L).user(owner).items(List.of(oi)).build();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        List<String> skipped = orderService.reorder(1L, OWNER_ID);

        assertThat(skipped).containsExactly("Black T-shirt (out of stock)");
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("reorder: νέο item στο cart με quantity capped στο available stock")
    void reorder_newCartItem_quantityCappedToStock() {
        // OrderItem ζητάει 20, stock=10 → cap στο 10
        variant.setStockQuantity(10);
        OrderItem oi = OrderItem.builder()
                .productName("Black T-shirt").variant(variant).quantity(20).build();
        Order order = Order.builder().id(1L).user(owner).items(List.of(oi)).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(cartItemRepository.findByUserIdAndVariantId(OWNER_ID, variant.getId()))
                .thenReturn(Optional.empty());

        List<String> skipped = orderService.reorder(1L, OWNER_ID);

        assertThat(skipped).isEmpty();
        ArgumentCaptor<CartItem> captor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository).save(captor.capture());
        assertThat(captor.getValue().getQuantity()).isEqualTo(10);
        assertThat(captor.getValue().getVariant()).isEqualTo(variant);
    }

    @Test
    @DisplayName("reorder: υπάρχον cart item → άθροισμα capped στο available")
    void reorder_existingCartItem_quantityAddedAndCapped() {
        // existing=7, reorder ζητάει 5, stock=10 → 7+5=12, capped στο 10
        variant.setStockQuantity(10);
        CartItem existing = CartItem.builder().user(owner).variant(variant).quantity(7).build();
        OrderItem oi = OrderItem.builder()
                .productName("Black T-shirt").variant(variant).quantity(5).build();
        Order order = Order.builder().id(1L).user(owner).items(List.of(oi)).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(cartItemRepository.findByUserIdAndVariantId(OWNER_ID, variant.getId()))
                .thenReturn(Optional.of(existing));

        orderService.reorder(1L, OWNER_ID);

        assertThat(existing.getQuantity()).isEqualTo(10);
        verify(cartItemRepository).save(existing);
    }

    @Test
    @DisplayName("reorder: υπάρχουσα ποσότητα ≥ stock → skip, ΔΕΝ μειώνει σιωπηρά το cart")
    void reorder_existingQuantityAlreadyAtOrAboveStock_skipsWithoutReducing() {
        // Σενάριο: ο χρήστης έχει ήδη 8 στο cart, stock=5 (κάποιος άλλος αγόρασε).
        // Παλιά: cart πήγαινε σε 5 (σιωπηρή μείωση). Τώρα: skip + cart αμετάβλητο.
        variant.setStockQuantity(5);
        CartItem existing = CartItem.builder().user(owner).variant(variant).quantity(8).build();
        OrderItem oi = OrderItem.builder()
                .productName("Black T-shirt").variant(variant).quantity(3).build();
        Order order = Order.builder().id(1L).user(owner).items(List.of(oi)).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(cartItemRepository.findByUserIdAndVariantId(OWNER_ID, variant.getId()))
                .thenReturn(Optional.of(existing));

        List<String> skipped = orderService.reorder(1L, OWNER_ID);

        assertThat(skipped).containsExactly("Black T-shirt (already at max in cart)");
        assertThat(existing.getQuantity()).isEqualTo(8); // αμετάβλητο — όχι σιωπηρή μείωση
        verify(cartItemRepository, never()).save(any(CartItem.class));
    }

    @Test
    @DisplayName("reorder: άγνωστο order → ResourceNotFoundException")
    void reorder_orderNotFound_throws() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.reorder(999L, OWNER_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("reorder: userId ≠ owner του order → AccessDenied, δεν αγγίζει το cart")
    void reorder_userIdDoesNotMatchOrderOwner_throwsAccessDenied() {
        Order order = Order.builder().id(1L).user(owner).items(List.of()).build();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // Καλείται με userId άλλου χρήστη (admin / impersonation / bug-στο-caller)
        assertThatThrownBy(() -> orderService.reorder(1L, OTHER_USER_ID))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("does not belong");

        verify(cartItemRepository, never()).save(any());
    }

    // ====================================================================
    //   getUserOrders / getOrderDetail / updateOrderStatus / getOrdersByStatus
    // ====================================================================

    @Test
    @DisplayName("getUserOrders: επιστρέφει mapped responses")
    void getUserOrders_returnsResponses() {
        Order o = Order.builder()
                .id(5L).orderNumber("ORD-ABC").user(owner)
                .status(OrderStatus.PENDING)
                .subtotal(new BigDecimal("10")).tax(new BigDecimal("1"))
                .shippingFee(new BigDecimal("5")).total(new BigDecimal("16"))
                .build();
        when(orderRepository.findByUserIdOrderByCreatedAtDesc(OWNER_ID)).thenReturn(List.of(o));

        List<OrderResponse> result = orderService.getUserOrders(OWNER_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).orderNumber()).isEqualTo("ORD-ABC");
        assertThat(result.get(0).total()).isEqualByComparingTo("16");
    }

    @Test
    @DisplayName("getOrderDetail: άγνωστο order → ResourceNotFoundException")
    void getOrderDetail_notFound_throws() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrderDetail(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("updateOrderStatus: ενημερώνει status και αποθηκεύει")
    void updateOrderStatus_changesStatus() {
        Order o = Order.builder()
                .id(1L).orderNumber("ORD-X").user(owner)
                .status(OrderStatus.PENDING)
                .subtotal(BigDecimal.ZERO).tax(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO).total(BigDecimal.ZERO)
                .build();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(o));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse response = orderService.updateOrderStatus(1L, OrderStatus.SHIPPED);

        assertThat(response.status()).isEqualTo("SHIPPED");
        assertThat(o.getStatus()).isEqualTo(OrderStatus.SHIPPED);
    }

    @Test
    @DisplayName("updateOrderStatus: άγνωστο order → ResourceNotFoundException")
    void updateOrderStatus_notFound_throws() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.updateOrderStatus(999L, OrderStatus.SHIPPED))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("getOrdersByStatus: φιλτράρει και επιστρέφει mapped responses")
    void getOrdersByStatus_returnsFilteredResponses() {
        Order o = Order.builder()
                .id(1L).orderNumber("ORD-Y").user(owner)
                .status(OrderStatus.SHIPPED)
                .subtotal(BigDecimal.ZERO).tax(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO).total(BigDecimal.ZERO)
                .build();
        when(orderRepository.findByStatus(OrderStatus.SHIPPED)).thenReturn(List.of(o));

        List<OrderResponse> result = orderService.getOrdersByStatus(OrderStatus.SHIPPED);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).status()).isEqualTo("SHIPPED");
    }

    // ====================================================================
    //   isOrderOwner
    // ====================================================================

    @Test
    @DisplayName("isOrderOwner: true όταν το order ανήκει στον authenticated user")
    void isOrderOwner_owner_returnsTrue() {
        Order o = Order.builder().id(1L).user(owner).build();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(o));

        assertThat(orderService.isOrderOwner(1L)).isTrue();
    }

    @Test
    @DisplayName("isOrderOwner: false όταν το order ανήκει σε άλλον user")
    void isOrderOwner_notOwner_returnsFalse() {
        User other = User.builder().id(OTHER_USER_ID).email("intruder@x").build();
        Order o = Order.builder().id(1L).user(other).build();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(o));

        assertThat(orderService.isOrderOwner(1L)).isFalse();
    }

    @Test
    @DisplayName("isOrderOwner: false όταν το order δεν υπάρχει")
    void isOrderOwner_orderMissing_returnsFalse() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThat(orderService.isOrderOwner(999L)).isFalse();
    }

    @Test
    @DisplayName("isOrderOwner: false όταν δεν υπάρχει authentication")
    void isOrderOwner_noAuth_returnsFalse() {
        SecurityContextHolder.clearContext();

        assertThat(orderService.isOrderOwner(1L)).isFalse();
    }
}
