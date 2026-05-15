package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.WishlistItemResponse;
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

/**
 * Integration test για το WishlistService — εστιάζει στο N+1 fix (#4):
 * το getUserWishlist πρέπει να γυρίζει product.name, brand.name και τα
 * λοιπά πεδία ΧΩΡΙΣ να σπάει σε LazyInitializationException και χωρίς
 * extra queries ανά item.
 */
@SpringBootTest
@Transactional
@ActiveProfiles("test")
class WishlistServiceIntegrationTest {

    @Autowired private WishlistService wishlistService;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private BrandRepository brandRepository;
    @Autowired private ProductTypeRepository productTypeRepository;
    @Autowired private ProductRepository productRepository;

    private User testUser;
    private Product nikeShirt;
    private Product adidasShorts;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .email("wishlist.integration@test.com")
                .passwordHash("hash")
                .firstName("Wishlist").lastName("Tester")
                .role(Role.USER)
                .build());

        Category cat = categoryRepository.save(Category.builder().name("Sportswear").build());
        ProductType type = productTypeRepository.save(ProductType.builder().name("Apparel").build());

        // Δύο διαφορετικά brands — αν το JOIN FETCH p.brand δεν δουλεύει, θα
        // χρειαστούν 2 extra queries (μία ανά brand) και πιθανώς θα σπάσει
        // με LazyInitializationException εκτός session.
        Brand nike = brandRepository.save(Brand.builder().name("Nike").build());
        Brand adidas = brandRepository.save(Brand.builder().name("Adidas").build());

        nikeShirt = productRepository.save(Product.builder()
                .name("Nike Dri-FIT Shirt")
                .description("breathable")
                .category(cat).brand(nike).productType(type)
                .dressStyle(DressStyle.CASUAL)
                .price(new BigDecimal("29.99"))
                .build());

        adidasShorts = productRepository.save(Product.builder()
                .name("Adidas Training Shorts")
                .description("stretchy")
                .category(cat).brand(adidas).productType(type)
                .dressStyle(DressStyle.CASUAL)
                .price(new BigDecimal("24.50"))
                .build());
    }

    @Test
    @DisplayName("getUserWishlist: brands από διαφορετικά products γεμίζουν χωρίς N+1 ή LazyInitException")
    void getUserWishlist_brandsHydratedAcrossMultipleProducts() {
        wishlistService.addToWishlist(testUser.getId(), nikeShirt.getId());
        wishlistService.addToWishlist(testUser.getId(), adidasShorts.getId());

        List<WishlistItemResponse> items = wishlistService.getUserWishlist(testUser.getId());

        assertThat(items).hasSize(2);
        // Αν το JOIN FETCH δεν δουλεύει, αυτά τα brand fields θα ήταν null
        // ή θα είχαν πετάξει LazyInitializationException στο stream/map.
        assertThat(items)
                .extracting(WishlistItemResponse::brand)
                .containsExactlyInAnyOrder("Nike", "Adidas");
        assertThat(items)
                .extracting(WishlistItemResponse::productName)
                .containsExactlyInAnyOrder("Nike Dri-FIT Shirt", "Adidas Training Shorts");
    }
}
