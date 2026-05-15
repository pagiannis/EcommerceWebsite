package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.OrderResponse;
import com.ecommerce.server.exception.BadRequestException;
import com.ecommerce.server.models.*;
import com.ecommerce.server.models.enums.*;
import com.ecommerce.server.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration Test για το OrderService (Critical Component).
 * Αυτό το τεστ σηκώνει ολόκληρο το Spring Context (μαζί με την in-memory H2 Βάση).
 * Δεν χρησιμοποιεί Mockito για τα repositories, ελέγχει πραγματικά αν γράφονται
 * τα δεδομένα στη Βάση, αν μειώνεται το stock, και αν αδειάζει το καλάθι.
 */
@SpringBootTest
@Transactional // Κάνει rollback μετά από κάθε test, κρατώντας τη βάση καθαρή
@ActiveProfiles("test") // Χρησιμοποιεί τυχόν test properties (αν υπάρχουν)
class OrderServiceIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

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

    @Autowired
    private OrderRepository orderRepository;

    private User testUser;
    private Address testAddress;
    private ProductVariant testVariant;

    @BeforeEach
    void setUp() {
        // 1. Δημιουργία User
        User user = User.builder()
                .email("integration.test@test.com")
                .passwordHash("hashedpassword")
                .firstName("Integration")
                .lastName("Tester")
                .role(Role.USER)
                .build();
        testUser = userRepository.save(user);

        // 2. Δημιουργία Διεύθυνσης (Shipping Address)
        Address address = Address.builder()
                .user(testUser)
                .street("Integration St. 1")
                .city("Athens")
                .postalCode("10000")
                .country("Greece")
                .isDefault(true)
                .build();
        testAddress = addressRepository.save(address);

        // 3. Δημιουργία Κατηγορίας, Μάρκας και Τύπου Προϊόντος
        Category category = categoryRepository.save(Category.builder().name("Test Category").build());
        Brand brand = brandRepository.save(Brand.builder().name("Test Brand").build());
        ProductType productType = productTypeRepository.save(ProductType.builder().name("Test Type").build());

        // 4. Δημιουργία Προϊόντος
        Product product = Product.builder()
                .name("Integration Test T-Shirt")
                .description("Test Desc")
                .category(category)
                .brand(brand)
                .productType(productType)
                .dressStyle(DressStyle.CASUAL)
                .price(new BigDecimal("20.00"))
                .build();
        product = productRepository.save(product);

        // 5. Δημιουργία Παραλλαγής Προϊόντος (Stock: 10)
        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .color(Color.BLACK)
                .size(Size.M)
                .stockQuantity(10)
                .sku("TEST-SKU-123")
                .build();
        testVariant = productVariantRepository.save(variant);
    }

    @Test
    @DisplayName("createOrder: Ολοκληρωμένη ροή. Αποθηκεύει παραγγελία, μειώνει stock, καθαρίζει καλάθι")
    void createOrder_success_integratesWithDatabase() {
        // ARRANGE: Προσθήκη ενός αντικειμένου στο καλάθι με ποσότητα 2
        CartItem cartItem = CartItem.builder()
                .user(testUser)
                .variant(testVariant)
                .quantity(2)
                .build();
        cartItemRepository.save(cartItem);

        // ACT: Εκτέλεση δημιουργίας παραγγελίας (Business Logic)
        OrderResponse response = orderService.createOrder(testUser.getId(), testAddress.getId(), PaymentMethod.CARD);

        // ASSERT 1: Έλεγχος ότι η παραγγελία επιστράφηκε σωστά και έχει πάρει ID (άρα γράφτηκε)
        assertThat(response).isNotNull();
        assertThat(response.id()).isNotNull();
        assertThat(response.orderNumber()).startsWith("ORD-");
        
        // Έλεγχος υπολογισμού: Υποσύνολο (2 * 20.00 = 40.00), Φόρος 10% (4.00), Μεταφορικά (5.00) = 49.00
        assertThat(response.subtotal()).isEqualByComparingTo("40.00");
        assertThat(response.total()).isEqualByComparingTo("49.00");

        // ASSERT 2: Επαλήθευση ότι αποθηκεύτηκε στη βάση δεδομένων
        Order savedOrder = orderRepository.findById(response.id()).orElseThrow();
        assertThat(savedOrder.getUser().getId()).isEqualTo(testUser.getId());
        assertThat(savedOrder.getItems()).hasSize(1);
        assertThat(savedOrder.getItems().get(0).getQuantity()).isEqualTo(2);

        // ASSERT 3: Έλεγχος μείωσης stock (Από 10, αγοράσαμε 2 -> Πρέπει να έχει μείνει 8)
        ProductVariant updatedVariant = productVariantRepository.findById(testVariant.getId()).orElseThrow();
        assertThat(updatedVariant.getStockQuantity()).isEqualTo(8);

        // ASSERT 4: Έλεγχος ότι το καλάθι άδειασε μετά το checkout
        List<CartItem> currentCart = cartItemRepository.findByUserId(testUser.getId());
        assertThat(currentCart).isEmpty();
    }

    /**
     * Regression για το #3: η validation γίνεται ΠΡΙΝ οποιοδήποτε write.
     * Πετάει BadRequestException → ο GlobalExceptionHandler το μεταφράζει σε HTTP 400.
     * Επιβεβαιώνουμε ότι το cart παραμένει ως έχει και το stock δεν μειώθηκε,
     * ώστε ο χρήστης να μπορεί να ξαναπροσπαθήσει διορθώνοντας την ποσότητα.
     */
    @Test
    @DisplayName("createOrder: insufficient stock → BadRequest, cart και stock μένουν ως έχουν")
    void createOrder_insufficientStock_cartAndStockUnchanged() {
        // Cart ζητάει 50, stock=10
        cartItemRepository.save(CartItem.builder()
                .user(testUser).variant(testVariant).quantity(50).build());

        assertThatThrownBy(() -> orderService.createOrder(
                testUser.getId(), testAddress.getId(), PaymentMethod.CARD))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Available: 10")
                .hasMessageContaining("Requested: 50");

        // Stock δεν μειώθηκε
        ProductVariant refreshed = productVariantRepository.findById(testVariant.getId()).orElseThrow();
        assertThat(refreshed.getStockQuantity()).isEqualTo(10);

        // Cart δεν άδειασε — ο χρήστης μπορεί να ξαναπροσπαθήσει
        List<CartItem> currentCart = cartItemRepository.findByUserId(testUser.getId());
        assertThat(currentCart).hasSize(1);
        assertThat(currentCart.get(0).getQuantity()).isEqualTo(50);
    }
}