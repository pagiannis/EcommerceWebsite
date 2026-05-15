package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.CartItemRequest;
import com.ecommerce.server.dto.response.CartItemResponse;
import com.ecommerce.server.dto.response.WishlistItemResponse;
import com.ecommerce.server.exception.BadRequestException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.models.Brand;
import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.User;
import com.ecommerce.server.models.WishlistItem;
import com.ecommerce.server.models.enums.Role;
import com.ecommerce.server.repository.ProductRepository;
import com.ecommerce.server.repository.UserRepository;
import com.ecommerce.server.repository.WishlistItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests για το WishlistService.
 *
 * Κάλυψη: λίστα/προσθήκη/αφαίρεση wishlist items, duplicate detection,
 * move-to-cart flow (delegates στο CartService) και existence checks.
 */
@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {

    private static final Long USER_ID = 1L;
    private static final Long PRODUCT_ID = 100L;
    private static final Long VARIANT_ID = 200L;

    @Mock
    private WishlistItemRepository wishlistItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartService cartService;

    @InjectMocks
    private WishlistService wishlistService;

    private User testUser;
    private Product testProduct;
    private WishlistItem existingItem;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(USER_ID)
                .email("user@test.com")
                .role(Role.USER)
                .build();

        Brand brand = Brand.builder().id(1L).name("TestBrand").build();

        testProduct = Product.builder()
                .id(PRODUCT_ID)
                .name("Test Product")
                .brand(brand)
                .price(new BigDecimal("29.99"))
                .images(new ArrayList<>())  // Empty list → imageUrl will be null
                .build();

        existingItem = WishlistItem.builder()
                .id(500L)
                .user(testUser)
                .product(testProduct)
                .addedAt(LocalDateTime.now())
                .build();
    }

    // ---------- getUserWishlist ----------

    @Test
    @DisplayName("getUserWishlist: επιστρέφει mapped λίστα από items")
    void getUserWishlist_returnsResponseList() {
        when(wishlistItemRepository.findByUserId(USER_ID))
                .thenReturn(List.of(existingItem));

        List<WishlistItemResponse> result = wishlistService.getUserWishlist(USER_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).productId()).isEqualTo(PRODUCT_ID);
        assertThat(result.get(0).productName()).isEqualTo("Test Product");
        assertThat(result.get(0).brand()).isEqualTo("TestBrand");
        assertThat(result.get(0).price()).isEqualByComparingTo("29.99");
        assertThat(result.get(0).imageUrl()).isNull();  // Άδεια λίστα εικόνων
    }

    // ---------- addToWishlist ----------

    @Test
    @DisplayName("addToWishlist: αν δεν βρεθεί ο user, ResourceNotFoundException")
    void addToWishlist_userNotFound_throws() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> wishlistService.addToWishlist(USER_ID, PRODUCT_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");

        verify(wishlistItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("addToWishlist: αν δεν βρεθεί το προϊόν, ResourceNotFoundException")
    void addToWishlist_productNotFound_throws() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> wishlistService.addToWishlist(USER_ID, PRODUCT_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found");

        verify(wishlistItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("addToWishlist: αν το προϊόν υπάρχει ήδη, BadRequestException")
    void addToWishlist_duplicate_throwsBadRequest() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(testProduct));
        when(wishlistItemRepository.findByUserIdAndProductId(USER_ID, PRODUCT_ID))
                .thenReturn(Optional.of(existingItem));

        assertThatThrownBy(() -> wishlistService.addToWishlist(USER_ID, PRODUCT_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already in wishlist");

        verify(wishlistItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("addToWishlist: success → αποθηκεύει και επιστρέφει response")
    void addToWishlist_success_savesItem() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(testProduct));
        when(wishlistItemRepository.findByUserIdAndProductId(USER_ID, PRODUCT_ID))
                .thenReturn(Optional.empty());
        when(wishlistItemRepository.save(any(WishlistItem.class))).thenAnswer(inv -> {
            WishlistItem item = inv.getArgument(0);
            item.setId(999L);
            return item;
        });

        WishlistItemResponse response = wishlistService.addToWishlist(USER_ID, PRODUCT_ID);

        assertThat(response.id()).isEqualTo(999L);
        assertThat(response.productId()).isEqualTo(PRODUCT_ID);
        assertThat(response.productName()).isEqualTo("Test Product");
    }

    // ---------- removeFromWishlist ----------

    @Test
    @DisplayName("removeFromWishlist: αν δεν βρεθεί, ResourceNotFoundException")
    void removeFromWishlist_notFound_throws() {
        when(wishlistItemRepository.findByUserIdAndProductId(USER_ID, PRODUCT_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> wishlistService.removeFromWishlist(USER_ID, PRODUCT_ID))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(wishlistItemRepository, never()).delete(any());
    }

    @Test
    @DisplayName("removeFromWishlist: success → καλεί το delete")
    void removeFromWishlist_success_deletes() {
        when(wishlistItemRepository.findByUserIdAndProductId(USER_ID, PRODUCT_ID))
                .thenReturn(Optional.of(existingItem));

        wishlistService.removeFromWishlist(USER_ID, PRODUCT_ID);

        verify(wishlistItemRepository).delete(existingItem);
    }

    // ---------- isInWishlist ----------

    @Test
    @DisplayName("isInWishlist: όταν υπάρχει, true")
    void isInWishlist_present_returnsTrue() {
        when(wishlistItemRepository.findByUserIdAndProductId(USER_ID, PRODUCT_ID))
                .thenReturn(Optional.of(existingItem));

        assertThat(wishlistService.isInWishlist(USER_ID, PRODUCT_ID)).isTrue();
    }

    @Test
    @DisplayName("isInWishlist: όταν λείπει, false")
    void isInWishlist_absent_returnsFalse() {
        when(wishlistItemRepository.findByUserIdAndProductId(USER_ID, PRODUCT_ID))
                .thenReturn(Optional.empty());

        assertThat(wishlistService.isInWishlist(USER_ID, PRODUCT_ID)).isFalse();
    }

    // ---------- moveToCart ----------

    @Test
    @DisplayName("moveToCart: success → ένα φόρτωμα wishlist item, addToCart, delete")
    void moveToCart_success_addsToCartAndRemovesFromWishlist() {
        CartItemResponse cartResponse = new CartItemResponse(
                1L, VARIANT_ID, "Test Product", "BLACK", "M",
                2, new BigDecimal("29.99"), new BigDecimal("59.98"));

        when(wishlistItemRepository.findByUserIdAndProductId(USER_ID, PRODUCT_ID))
                .thenReturn(Optional.of(existingItem));
        when(cartService.addToCart(eq(USER_ID), any(CartItemRequest.class)))
                .thenReturn(cartResponse);

        CartItemResponse response = wishlistService.moveToCart(USER_ID, PRODUCT_ID, VARIANT_ID, 2);

        assertThat(response).isEqualTo(cartResponse);
        verify(cartService).addToCart(eq(USER_ID), any(CartItemRequest.class));
        verify(wishlistItemRepository).delete(existingItem);
        // Regression guard: το wishlist item πρέπει να φορτωθεί ΜΟΝΟ ΜΙΑ φορά.
        // Παλιά γινόταν 2 SELECTs (orElseThrow + removeFromWishlist).
        verify(wishlistItemRepository, times(1)).findByUserIdAndProductId(USER_ID, PRODUCT_ID);
    }

    @Test
    @DisplayName("moveToCart: αν δεν είναι στο wishlist, ResourceNotFoundException")
    void moveToCart_notInWishlist_throws() {
        when(wishlistItemRepository.findByUserIdAndProductId(USER_ID, PRODUCT_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> wishlistService.moveToCart(USER_ID, PRODUCT_ID, VARIANT_ID, 1))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(cartService, never()).addToCart(any(), any());
    }
}
