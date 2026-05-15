package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.ReviewRequest;
import com.ecommerce.server.dto.response.ReviewResponse;
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

/**
 * Integration test για το ReviewService — εστιάζει στην atomic recalculation
 * του product rating/reviewCount στη βάση (#1: race condition fix).
 *
 * Παλιά η λογική (Math.round, .size()) ήταν στο Java service· τώρα ζει στο
 * SQL UPDATE. Άρα η rounding/null-handling/count απόδειξη ΠΡΕΠΕΙ να γίνει
 * end-to-end με πραγματική βάση, όχι με mocks.
 */
@SpringBootTest
@Transactional
@ActiveProfiles("test")
class ReviewServiceIntegrationTest {

    @Autowired private ReviewService reviewService;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private BrandRepository brandRepository;
    @Autowired private ProductTypeRepository productTypeRepository;
    @Autowired private ProductRepository productRepository;

    private User testUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .email("review.integration@test.com")
                .passwordHash("hash")
                .firstName("Review").lastName("Tester")
                .role(Role.USER)
                .build());

        Category cat = categoryRepository.save(Category.builder().name("ReviewCat").build());
        Brand brand = brandRepository.save(Brand.builder().name("ReviewBrand").build());
        ProductType type = productTypeRepository.save(ProductType.builder().name("ReviewType").build());

        testProduct = productRepository.save(Product.builder()
                .name("Review Test Product")
                .description("d")
                .category(cat).brand(brand).productType(type)
                .dressStyle(DressStyle.CASUAL)
                .price(new BigDecimal("20.00"))
                .rating(0.0)
                .reviewCount(0)
                .build());

        // deleteReview έχει service-level ownership guard — στήνουμε
        // authenticated user, καθαρίζουμε στο @AfterEach.
        AuthUser principal = new AuthUser(testUser.getId(), testUser.getEmail(), "HASH", List.of());
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, "HASH", List.of());
        SecurityContextHolder.setContext(new SecurityContextImpl(auth));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("createReview: μετά από 3 reviews (5,4,4) → rating=4.3 (στρογγυλοποίηση στη βάση), count=3")
    void createReview_roundsAverageToOneDecimal() {
        reviewService.createReview(testUser.getId(),
                new ReviewRequest(testProduct.getId(), 5, "great"));
        reviewService.createReview(testUser.getId(),
                new ReviewRequest(testProduct.getId(), 4, "good"));
        reviewService.createReview(testUser.getId(),
                new ReviewRequest(testProduct.getId(), 4, "good"));

        // Force flush για να δούμε το αποτέλεσμα του atomic UPDATE από fresh read
        Product refreshed = productRepository.findById(testProduct.getId()).orElseThrow();
        assertThat(refreshed.getReviewCount()).isEqualTo(3);
        // avg = 13/3 = 4.333... → στρογγυλοποίηση από το SQL → 4.3
        assertThat(refreshed.getRating()).isEqualTo(4.3);
    }

    @Test
    @DisplayName("deleteReview: μετά τη διαγραφή του μόνου review → rating=0.0, count=0 (null avg → COALESCE 0.0)")
    void deleteReview_lastReviewRemoved_resetsRatingAndCount() {
        var created = reviewService.createReview(testUser.getId(),
                new ReviewRequest(testProduct.getId(), 5, "first"));

        Product afterCreate = productRepository.findById(testProduct.getId()).orElseThrow();
        assertThat(afterCreate.getReviewCount()).isEqualTo(1);
        assertThat(afterCreate.getRating()).isEqualTo(5.0);

        reviewService.deleteReview(created.id());

        Product afterDelete = productRepository.findById(testProduct.getId()).orElseThrow();
        assertThat(afterDelete.getReviewCount()).isEqualTo(0);
        // AVG πάνω σε άδειο set → NULL → COALESCE → 0.0
        assertThat(afterDelete.getRating()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("createReview: 2 διαδοχικά reviews — count μεταβαίνει 0 → 1 → 2 χωρίς lost updates")
    void createReview_sequentialReviews_countIsAlwaysCorrect() {
        // Δεν μπορούμε να αναπαράγουμε εύκολα true concurrency σε
        // @Transactional H2 test. Αλλά μπορούμε να αποδείξουμε ότι το
        // counting είναι σταθερό read-modify-write από τη βάση και ότι
        // δεν βασίζεται σε σταθερό snapshot στη Java μνήμη.
        reviewService.createReview(testUser.getId(),
                new ReviewRequest(testProduct.getId(), 5, "a"));
        assertThat(productRepository.findById(testProduct.getId()).orElseThrow()
                .getReviewCount()).isEqualTo(1);

        reviewService.createReview(testUser.getId(),
                new ReviewRequest(testProduct.getId(), 3, "b"));
        assertThat(productRepository.findById(testProduct.getId()).orElseThrow()
                .getReviewCount()).isEqualTo(2);

        // rating = (5+3)/2 = 4.0
        assertThat(productRepository.findById(testProduct.getId()).orElseThrow()
                .getRating()).isEqualTo(4.0);
    }

    // ====================================================================
    //   getProductReviews / getUserReviews — N+1 (bug #10)
    // ====================================================================

    @Test
    @DisplayName("getProductReviews: επιστρέφει paginated mapped responses με όνομα user (JOIN FETCH user)")
    void getProductReviews_includesUserNameWithoutLazyError() {
        reviewService.createReview(testUser.getId(),
                new ReviewRequest(testProduct.getId(), 5, "first"));
        reviewService.createReview(testUser.getId(),
                new ReviewRequest(testProduct.getId(), 4, "second"));

        var page = reviewService.getProductReviews(
                testProduct.getId(), "LATEST", null, 0, 10);

        assertThat(page.getTotalElements()).isEqualTo(2);
        assertThat(page.getContent()).hasSize(2);
        // Αν το JOIN FETCH δεν δουλεύει, το userName θα ήταν null ή θα έσπαγε
        // σε LazyInitializationException έξω από session — επιβεβαιώνουμε ότι
        // έρχεται γεμάτο και απευθείας στο DTO.
        assertThat(page.getContent().get(0).userName()).isEqualTo("Review Tester");
        assertThat(page.getContent().get(1).userName()).isEqualTo("Review Tester");
    }

    @Test
    @DisplayName("getUserReviews: επιστρέφει mapped responses με productId (JOIN FETCH product)")
    void getUserReviews_includesProductIdWithoutLazyError() {
        reviewService.createReview(testUser.getId(),
                new ReviewRequest(testProduct.getId(), 5, "ok"));

        List<ReviewResponse> results = reviewService.getUserReviews(testUser.getId());

        assertThat(results).hasSize(1);
        assertThat(results.get(0).productId()).isEqualTo(testProduct.getId());
    }

    @Test
    @DisplayName("getProductReviews: 5 reviews, size=2 → 3 pages, σωστά totalElements/totalPages")
    void getProductReviews_paginationMetadataIsCorrect() {
        for (int i = 0; i < 5; i++) {
            reviewService.createReview(testUser.getId(),
                    new ReviewRequest(testProduct.getId(), 5, "r" + i));
        }

        var page0 = reviewService.getProductReviews(testProduct.getId(), "LATEST", null, 0, 2);
        var page2 = reviewService.getProductReviews(testProduct.getId(), "LATEST", null, 2, 2);

        assertThat(page0.getTotalElements()).isEqualTo(5);
        assertThat(page0.getTotalPages()).isEqualTo(3);
        assertThat(page0.getContent()).hasSize(2);
        assertThat(page0.isFirst()).isTrue();
        assertThat(page0.isLast()).isFalse();

        assertThat(page2.getContent()).hasSize(1); // τελευταία σελίδα έχει 1 review
        assertThat(page2.isLast()).isTrue();
    }
}
