package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.CartItemRequest;
import com.ecommerce.server.dto.response.CartItemResponse;
import com.ecommerce.server.exception.BadRequestException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.models.CartItem;
import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.ProductVariant;
import com.ecommerce.server.models.User;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.Size;
import com.ecommerce.server.repository.CartItemRepository;
import com.ecommerce.server.repository.ProductVariantRepository;
import com.ecommerce.server.repository.UserRepository;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests για το CartService.
 *
 * Νέα concepts σε σχέση με το UserServiceTest:
 *
 * 1) SecurityContextHolder: το CartService διαβάζει τον τρέχοντα authenticated
 *    user από το SecurityContext (για να ελέγξει ownership). Άρα στο
 *    @BeforeEach στήνουμε ένα ψεύτικο Authentication και στο @AfterEach
 *    το καθαρίζουμε — αλλιώς θα διαρρεύσει σε επόμενα tests.
 *
 * 2) Βαθιά object graphs (CartItem -> Variant -> Product): η convertToResponse()
 *    κάνει deep navigation, οπότε χτίζουμε πραγματικά entities με builders
 *    αντί να mock-άρουμε μια ολόκληρη αλυσίδα από getters.
 */
@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    private static final Long OWNER_ID = 1L;
    private static final String OWNER_EMAIL = "owner@test.com";
    private static final Long OTHER_USER_ID = 2L;
    private static final String OTHER_USER_EMAIL = "intruder@test.com";

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    private User owner;
    private Product product;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(OWNER_ID)
                .email(OWNER_EMAIL)
                .build();

        product = Product.builder()
                .id(10L)
                .name("Black T-shirt")
                .price(new BigDecimal("20.00"))
                .build();

        variant = ProductVariant.builder()
                .id(100L)
                .product(product)
                .color(Color.BLACK)
                .size(Size.M)
                .stockQuantity(5)
                .build();

        // Στήνουμε authenticated user στο SecurityContext.
        // Το CartService διαβάζει το email από εκεί για ownership checks.
        AuthUser principal = new AuthUser(OWNER_ID, OWNER_EMAIL, "HASH", List.of());
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, "HASH", List.of());
        SecurityContextHolder.setContext(new SecurityContextImpl(auth));
    }

    @AfterEach
    void clearSecurityContext() {
        // ΠΟΛΥ ΣΗΜΑΝΤΙΚΟ: το SecurityContextHolder είναι thread-local.
        // Αν δεν το καθαρίσουμε, το authentication "διαρρέει" σε επόμενα tests.
        SecurityContextHolder.clearContext();
    }

    // ====================================================================
    //   getUserCart
    // ====================================================================

    @Test
    @DisplayName("getUserCart: επιστρέφει mapped CartItemResponse list")
    void getUserCart_returnsResponseList() {
        CartItem item = CartItem.builder()
                .id(50L)
                .user(owner)
                .variant(variant)
                .quantity(2)
                .build();
        when(cartItemRepository.findByUserId(OWNER_ID)).thenReturn(List.of(item));

        List<CartItemResponse> result = cartService.getUserCart(OWNER_ID);

        assertThat(result).hasSize(1);
        CartItemResponse r = result.get(0);
        assertThat(r.id()).isEqualTo(50L);
        assertThat(r.productName()).isEqualTo("Black T-shirt");
        assertThat(r.quantity()).isEqualTo(2);
        assertThat(r.unitPrice()).isEqualByComparingTo("20.00");
        assertThat(r.subtotal()).isEqualByComparingTo("40.00"); // 20 * 2
    }

    // ====================================================================
    //   addToCart — happy paths & validations
    // ====================================================================

    @Test
    @DisplayName("addToCart: νέο item αποθηκεύεται με τη ζητούμενη ποσότητα")
    void addToCart_newItem_savesWithRequestedQuantity() {
        CartItemRequest req = new CartItemRequest(variant.getId(), 3);
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(productVariantRepository.findById(variant.getId())).thenReturn(Optional.of(variant));
        when(cartItemRepository.findByUserIdAndVariantId(OWNER_ID, variant.getId()))
                .thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

        CartItemResponse response = cartService.addToCart(OWNER_ID, req);

        assertThat(response.quantity()).isEqualTo(3);
        assertThat(response.subtotal()).isEqualByComparingTo("60.00"); // 20 * 3

        ArgumentCaptor<CartItem> captor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository).save(captor.capture());
        CartItem saved = captor.getValue();
        assertThat(saved.getUser()).isEqualTo(owner);
        assertThat(saved.getVariant()).isEqualTo(variant);
        assertThat(saved.getQuantity()).isEqualTo(3);
    }

    @Test
    @DisplayName("addToCart: αν υπάρχει ήδη το variant, αθροίζει τις ποσότητες")
    void addToCart_existingItem_addsQuantities() {
        CartItem existing = CartItem.builder()
                .id(50L).user(owner).variant(variant).quantity(2).build();

        CartItemRequest req = new CartItemRequest(variant.getId(), 2);
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(productVariantRepository.findById(variant.getId())).thenReturn(Optional.of(variant));
        when(cartItemRepository.findByUserIdAndVariantId(OWNER_ID, variant.getId()))
                .thenReturn(Optional.of(existing));
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

        CartItemResponse response = cartService.addToCart(OWNER_ID, req);

        assertThat(response.quantity()).isEqualTo(4); // 2 + 2
        assertThat(existing.getQuantity()).isEqualTo(4); // και το ίδιο το entity ενημερώθηκε
    }

    @Test
    @DisplayName("addToCart: quantity <= 0 πετάει BadRequestException")
    void addToCart_zeroQuantity_throwsBadRequest() {
        CartItemRequest req = new CartItemRequest(variant.getId(), 0);
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(productVariantRepository.findById(variant.getId())).thenReturn(Optional.of(variant));

        assertThatThrownBy(() -> cartService.addToCart(OWNER_ID, req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("greater than 0");

        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("addToCart: quantity > stock πετάει BadRequestException με διαθέσιμο stock στο message")
    void addToCart_exceedsStock_throwsBadRequest() {
        CartItemRequest req = new CartItemRequest(variant.getId(), 10); // stock=5
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(productVariantRepository.findById(variant.getId())).thenReturn(Optional.of(variant));

        assertThatThrownBy(() -> cartService.addToCart(OWNER_ID, req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Available: 5");

        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("addToCart: άθροισμα νέας + υπάρχουσας ποσότητας > stock πετάει BadRequestException")
    void addToCart_existingPlusNewExceedsStock_throws() {
        // stock=5, existing=3, request=3 -> total 6 > 5
        CartItem existing = CartItem.builder()
                .id(50L).user(owner).variant(variant).quantity(3).build();
        CartItemRequest req = new CartItemRequest(variant.getId(), 3);

        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(productVariantRepository.findById(variant.getId())).thenReturn(Optional.of(variant));
        when(cartItemRepository.findByUserIdAndVariantId(OWNER_ID, variant.getId()))
                .thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> cartService.addToCart(OWNER_ID, req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Total quantity exceeds");

        verify(cartItemRepository, never()).save(any());
        assertThat(existing.getQuantity()).isEqualTo(3); // δεν άλλαξε
    }

    @Test
    @DisplayName("addToCart: άγνωστος user → ResourceNotFoundException")
    void addToCart_userNotFound_throws() {
        CartItemRequest req = new CartItemRequest(variant.getId(), 1);
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartService.addToCart(OWNER_ID, req))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("addToCart: άγνωστο variant → ResourceNotFoundException")
    void addToCart_variantNotFound_throws() {
        CartItemRequest req = new CartItemRequest(999L, 1);
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(productVariantRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartService.addToCart(OWNER_ID, req))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Variant not found");
    }

    // ====================================================================
    //   updateQuantity
    // ====================================================================

    @Test
    @DisplayName("updateQuantity: ενημερώνει την ποσότητα όταν είναι εντός stock")
    void updateQuantity_validQuantity_updates() {
        CartItem item = CartItem.builder()
                .id(50L).user(owner).variant(variant).quantity(1).build();
        when(cartItemRepository.findById(50L)).thenReturn(Optional.of(item));
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

        CartItemResponse response = cartService.updateQuantity(50L, 4);

        assertThat(response.quantity()).isEqualTo(4);
        assertThat(item.getQuantity()).isEqualTo(4);
    }

    @Test
    @DisplayName("updateQuantity: quantity > stock πετάει BadRequestException")
    void updateQuantity_exceedsStock_throws() {
        CartItem item = CartItem.builder()
                .id(50L).user(owner).variant(variant).quantity(1).build();
        when(cartItemRepository.findById(50L)).thenReturn(Optional.of(item));

        assertThatThrownBy(() -> cartService.updateQuantity(50L, 99))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Available: 5");

        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateQuantity: άγνωστο cart item → ResourceNotFoundException")
    void updateQuantity_notFound_throws() {
        when(cartItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartService.updateQuantity(999L, 1))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("updateQuantity: άλλος user προσπαθεί να αλλάξει item που δεν του ανήκει → AccessDenied")
    void updateQuantity_notOwner_throwsAccessDenied() {
        User other = User.builder().id(OTHER_USER_ID).email(OTHER_USER_EMAIL).build();
        CartItem item = CartItem.builder()
                .id(50L).user(other).variant(variant).quantity(1).build();
        // Στο SecurityContext έχουμε τον "owner@test.com" αλλά το item ανήκει στον "intruder"
        when(cartItemRepository.findById(50L)).thenReturn(Optional.of(item));

        assertThatThrownBy(() -> cartService.updateQuantity(50L, 2))
                .isInstanceOf(AccessDeniedException.class);

        verify(cartItemRepository, never()).save(any());
    }

    // ====================================================================
    //   removeFromCart
    // ====================================================================

    @Test
    @DisplayName("removeFromCart: διαγράφει το item αν ανήκει στον authenticated user")
    void removeFromCart_owner_deletes() {
        CartItem item = CartItem.builder()
                .id(50L).user(owner).variant(variant).quantity(1).build();
        when(cartItemRepository.findById(50L)).thenReturn(Optional.of(item));

        cartService.removeFromCart(50L);

        verify(cartItemRepository).delete(item);
    }

    @Test
    @DisplayName("removeFromCart: άλλος user → AccessDenied, δεν διαγράφει")
    void removeFromCart_notOwner_throws() {
        User other = User.builder().id(OTHER_USER_ID).email(OTHER_USER_EMAIL).build();
        CartItem item = CartItem.builder()
                .id(50L).user(other).variant(variant).quantity(1).build();
        when(cartItemRepository.findById(50L)).thenReturn(Optional.of(item));

        assertThatThrownBy(() -> cartService.removeFromCart(50L))
                .isInstanceOf(AccessDeniedException.class);

        verify(cartItemRepository, never()).delete(any());
    }

    @Test
    @DisplayName("removeFromCart: άγνωστο item → ResourceNotFoundException")
    void removeFromCart_notFound_throws() {
        when(cartItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartService.removeFromCart(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ====================================================================
    //   clearCart
    // ====================================================================

    @Test
    @DisplayName("clearCart: καλεί το repository deleteByUserId")
    void clearCart_callsRepository() {
        cartService.clearCart(OWNER_ID);
        verify(cartItemRepository).deleteByUserId(OWNER_ID);
    }

    // ====================================================================
    //   isCartItemOwner (για @PreAuthorize SpEL)
    // ====================================================================

    @Test
    @DisplayName("isCartItemOwner: true όταν το item ανήκει στον authenticated user")
    void isCartItemOwner_owner_returnsTrue() {
        CartItem item = CartItem.builder()
                .id(50L).user(owner).variant(variant).quantity(1).build();
        when(cartItemRepository.findById(50L)).thenReturn(Optional.of(item));

        assertThat(cartService.isCartItemOwner(50L)).isTrue();
    }

    @Test
    @DisplayName("isCartItemOwner: false όταν το item ανήκει σε άλλον user")
    void isCartItemOwner_notOwner_returnsFalse() {
        User other = User.builder().id(OTHER_USER_ID).email(OTHER_USER_EMAIL).build();
        CartItem item = CartItem.builder()
                .id(50L).user(other).variant(variant).quantity(1).build();
        when(cartItemRepository.findById(50L)).thenReturn(Optional.of(item));

        assertThat(cartService.isCartItemOwner(50L)).isFalse();
    }

    @Test
    @DisplayName("isCartItemOwner: false όταν το cart item δεν υπάρχει")
    void isCartItemOwner_itemMissing_returnsFalse() {
        when(cartItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThat(cartService.isCartItemOwner(999L)).isFalse();
    }

    @Test
    @DisplayName("isCartItemOwner: false όταν δεν υπάρχει authentication στο SecurityContext")
    void isCartItemOwner_noAuth_returnsFalse() {
        SecurityContextHolder.clearContext(); // shadow το BeforeEach setup

        assertThat(cartService.isCartItemOwner(50L)).isFalse();
    }
}