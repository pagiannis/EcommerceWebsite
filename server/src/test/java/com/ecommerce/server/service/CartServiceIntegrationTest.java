package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.CartItemRequest;
import com.ecommerce.server.dto.response.CartItemResponse;
import com.ecommerce.server.exception.BadRequestException;
import com.ecommerce.server.models.*;
import com.ecommerce.server.models.enums.*;
import com.ecommerce.server.repository.*;
import com.ecommerce.server.security.AuthUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration Test για το CartService (Critical Component #3 από Deloitte spec).
 * Σηκώνει ολόκληρο το Spring Context με H2 in-memory βάση, ώστε να επιβεβαιώσει
 * ότι η ροή προσθήκης/άθροισης ποσοτήτων/καθαρισμού καλαθιού γράφεται σωστά
 * στη βάση και ότι το stock validation δουλεύει με πραγματικά δεδομένα.
 */
@SpringBootTest
@Transactional
@ActiveProfiles("test")
class CartServiceIntegrationTest {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductTypeRepository productTypeRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    private User testUser;
    private ProductVariant testVariant;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .email("cart.integration@test.com")
                .passwordHash("hash")
                .firstName("Cart")
                .lastName("Tester")
                .role(Role.USER)
                .build());

        Category category = categoryRepository.save(Category.builder().name("Cat").build());
        Brand brand = brandRepository.save(Brand.builder().name("Brand").build());
        ProductType type = productTypeRepository.save(ProductType.builder().name("Type").build());

        Product product = productRepository.save(Product.builder()
                .name("Cart Test Shirt")
                .description("desc")
                .category(category)
                .brand(brand)
                .productType(type)
                .dressStyle(DressStyle.CASUAL)
                .price(new BigDecimal("15.00"))
                .build());

        testVariant = productVariantRepository.save(ProductVariant.builder()
                .product(product)
                .color(Color.WHITE)
                .size(Size.L)
                .stockQuantity(5)
                .sku("CART-TEST-001")
                .build());
    }

    @Test
    @DisplayName("addToCart: end-to-end → νέο item γράφεται στη βάση και επιστρέφεται σωστά")
    void addToCart_newItem_persistsToDatabase() {
        CartItemRequest request = new CartItemRequest(testVariant.getId(), 2);

        CartItemResponse response = cartService.addToCart(testUser.getId(), request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isNotNull();
        assertThat(response.quantity()).isEqualTo(2);
        assertThat(response.subtotal()).isEqualByComparingTo("30.00");

        // Επιβεβαίωση ότι όντως γράφτηκε στη βάση
        List<CartItem> persisted = cartItemRepository.findByUserId(testUser.getId());
        assertThat(persisted).hasSize(1);
        assertThat(persisted.get(0).getQuantity()).isEqualTo(2);
    }

    @Test
    @DisplayName("addToCart: 2η προσθήκη ίδιου variant αθροίζει την ποσότητα (1 entry, qty=5)")
    void addToCart_existingItem_aggregatesQuantity() {
        cartService.addToCart(testUser.getId(), new CartItemRequest(testVariant.getId(), 2));
        cartService.addToCart(testUser.getId(), new CartItemRequest(testVariant.getId(), 3));

        List<CartItem> persisted = cartItemRepository.findByUserId(testUser.getId());
        assertThat(persisted).hasSize(1);  // ένα entry, όχι δύο
        assertThat(persisted.get(0).getQuantity()).isEqualTo(5);  // 2 + 3
    }

    @Test
    @DisplayName("addToCart: ξεπερνά το stock (5) → BadRequestException, τίποτα δεν γράφεται")
    void addToCart_exceedsStock_throwsAndNothingPersisted() {
        CartItemRequest request = new CartItemRequest(testVariant.getId(), 10);  // stock=5

        assertThatThrownBy(() -> cartService.addToCart(testUser.getId(), request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Available: 5");

        assertThat(cartItemRepository.findByUserId(testUser.getId())).isEmpty();
    }

    @Test
    @DisplayName("getUserCart + clearCart: end-to-end → επιστρέφει items και μετά αδειάζει")
    void getUserCart_thenClearCart_emptiesDatabase() {
        cartService.addToCart(testUser.getId(), new CartItemRequest(testVariant.getId(), 1));

        List<CartItemResponse> beforeClear = cartService.getUserCart(testUser.getId());
        assertThat(beforeClear).hasSize(1);

        cartService.clearCart(testUser.getId());

        assertThat(cartService.getUserCart(testUser.getId())).isEmpty();
        assertThat(cartItemRepository.findByUserId(testUser.getId())).isEmpty();
    }

    // Στήνει authenticated user στο SecurityContext — απαιτείται για τις
    // updateQuantity / removeFromCart που τρέχουν ownership check μέσω
    // requireCartItemOwner (διαβάζει το email από το SecurityContextHolder).
    // Καθαρίζεται στο @AfterEach για να μη διαρρεύσει σε επόμενα tests.
    private void authenticateAsTestUser() {
        AuthUser principal = new AuthUser(testUser.getId(), testUser.getEmail(), "HASH", List.of());
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, "HASH", List.of());
        SecurityContextHolder.setContext(new SecurityContextImpl(auth));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("updateQuantity: end-to-end → η νέα ποσότητα γράφεται στη βάση")
    void updateQuantity_persistsToDatabase() {
        authenticateAsTestUser();
        CartItemResponse added = cartService.addToCart(
                testUser.getId(), new CartItemRequest(testVariant.getId(), 1));

        cartService.updateQuantity(added.id(), 4);

        CartItem reloaded = cartItemRepository.findById(added.id()).orElseThrow();
        assertThat(reloaded.getQuantity()).isEqualTo(4);
    }

    @Test
    @DisplayName("updateQuantity: ξεπερνά το stock (5) → BadRequest, ποσότητα στη βάση αμετάβλητη")
    void updateQuantity_exceedsStock_throwsAndQuantityUnchanged() {
        authenticateAsTestUser();
        CartItemResponse added = cartService.addToCart(
                testUser.getId(), new CartItemRequest(testVariant.getId(), 2));

        assertThatThrownBy(() -> cartService.updateQuantity(added.id(), 99))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Available: 5");

        CartItem reloaded = cartItemRepository.findById(added.id()).orElseThrow();
        assertThat(reloaded.getQuantity()).isEqualTo(2); // δεν άλλαξε
    }

    @Test
    @DisplayName("removeFromCart: end-to-end → το cart item διαγράφεται από τη βάση")
    void removeFromCart_deletesFromDatabase() {
        authenticateAsTestUser();
        CartItemResponse added = cartService.addToCart(
                testUser.getId(), new CartItemRequest(testVariant.getId(), 1));
        assertThat(cartItemRepository.findById(added.id())).isPresent();

        cartService.removeFromCart(added.id());

        assertThat(cartItemRepository.findById(added.id())).isEmpty();
        assertThat(cartItemRepository.findByUserId(testUser.getId())).isEmpty();
    }
}
