package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.ReviewRequest;
import com.ecommerce.server.dto.response.ReviewResponse;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.Review;
import com.ecommerce.server.models.User;
import com.ecommerce.server.models.enums.Role;
import com.ecommerce.server.repository.ProductRepository;
import com.ecommerce.server.repository.ReviewRepository;
import com.ecommerce.server.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests για το ReviewService.
 *
 * Εστιάζει στη λογική του updateProductRating που τρέχει σε create/delete review:
 *  - στρογγυλοποίηση στο 1 δεκαδικό (αλλιώς UI δείχνει 4.333333...)
 *  - χρήση COUNT αντί να φορτώνουμε όλα τα Review entities στη μνήμη
 */
@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    private static final Long USER_ID = 1L;
    private static final Long PRODUCT_ID = 100L;

    @Mock private ReviewRepository reviewRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User testUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(USER_ID)
                .email("reviewer@test.com")
                .firstName("Άννα")
                .lastName("Παπαδημητρίου")
                .role(Role.USER)
                .build();

        testProduct = Product.builder()
                .id(PRODUCT_ID)
                .name("Test Product")
                .build();
    }

    // ====================================================================
    //   createReview — happy path + rating snapshot
    // ====================================================================

    @Test
    @DisplayName("createReview: αποθηκεύει review και ενημερώνει product rating στρογγυλοποιημένο στο 1 δεκαδικό")
    void createReview_persistsAndUpdatesRoundedRating() {
        ReviewRequest request = new ReviewRequest(PRODUCT_ID, 5, "Great");

        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(testProduct));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(42L);
            r.setCreatedAt(LocalDateTime.now());
            return r;
        });
        // Στο updateProductRating
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(testProduct));
        when(reviewRepository.findAverageRatingByProductId(PRODUCT_ID)).thenReturn(4.333333);
        when(reviewRepository.countByProductId(PRODUCT_ID)).thenReturn(3L);

        ReviewResponse response = reviewService.createReview(USER_ID, request);

        assertThat(response.id()).isEqualTo(42L);
        assertThat(response.rating()).isEqualTo(5);
        assertThat(testProduct.getRating()).isEqualTo(4.3); // ΟΧΙ 4.333333
        assertThat(testProduct.getReviewCount()).isEqualTo(3);
    }

    // ====================================================================
    //   updateProductRating (μέσω createReview) — bug fixes #8, #9
    // ====================================================================

    @Test
    @DisplayName("updateProductRating: avg 4.05 → στρογγυλεύεται στο 4.1 (HALF_UP)")
    void updateProductRating_roundsAverageToOneDecimal() {
        ReviewRequest request = new ReviewRequest(PRODUCT_ID, 4, "ok");
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(testProduct));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewRepository.findAverageRatingByProductId(PRODUCT_ID)).thenReturn(4.05);
        when(reviewRepository.countByProductId(PRODUCT_ID)).thenReturn(20L);

        reviewService.createReview(USER_ID, request);

        // Math.round(4.05 * 10.0) / 10.0 = 41/10.0 = 4.1
        assertThat(testProduct.getRating()).isEqualTo(4.1);
    }

    @Test
    @DisplayName("updateProductRating: null average (πρώτο/καθαρό προϊόν) → rating γίνεται 0.0")
    void updateProductRating_nullAverage_defaultsToZero() {
        ReviewRequest request = new ReviewRequest(PRODUCT_ID, 1, "");
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(testProduct));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewRepository.findAverageRatingByProductId(PRODUCT_ID)).thenReturn(null);
        when(reviewRepository.countByProductId(PRODUCT_ID)).thenReturn(0L);

        reviewService.createReview(USER_ID, request);

        assertThat(testProduct.getRating()).isEqualTo(0.0);
        assertThat(testProduct.getReviewCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("updateProductRating: χρησιμοποιεί count(), όχι load-all (memory regression)")
    void updateProductRating_usesCount_notFindAll() {
        ReviewRequest request = new ReviewRequest(PRODUCT_ID, 5, "x");
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(testProduct));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewRepository.findAverageRatingByProductId(PRODUCT_ID)).thenReturn(5.0);
        when(reviewRepository.countByProductId(PRODUCT_ID)).thenReturn(1L);

        reviewService.createReview(USER_ID, request);

        verify(reviewRepository).countByProductId(PRODUCT_ID);
        // ΠΟΤΕ δεν φορτώνουμε τη λίστα των reviews μόνο για να τη μετρήσουμε
        verify(reviewRepository, never()).findByProductIdOrderByCreatedAtDesc(any());
    }

    // ====================================================================
    //   createReview — failure modes
    // ====================================================================

    @Test
    @DisplayName("createReview: άγνωστος user → ResourceNotFoundException")
    void createReview_userNotFound_throws() {
        ReviewRequest request = new ReviewRequest(PRODUCT_ID, 5, null);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview(USER_ID, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");

        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("createReview: άγνωστο product → ResourceNotFoundException")
    void createReview_productNotFound_throws() {
        ReviewRequest request = new ReviewRequest(PRODUCT_ID, 5, null);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview(USER_ID, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found");

        verify(reviewRepository, never()).save(any());
    }

    // ====================================================================
    //   deleteReview — και αυτή καλεί updateProductRating
    // ====================================================================

    @Test
    @DisplayName("deleteReview: διαγράφει review και ξανά-υπολογίζει στρογγυλοποιημένο rating")
    void deleteReview_recalculatesRoundedRating() {
        Review review = Review.builder()
                .id(7L).user(testUser).product(testProduct).rating(2).build();

        when(reviewRepository.findById(7L)).thenReturn(Optional.of(review));
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(testProduct));
        when(reviewRepository.findAverageRatingByProductId(PRODUCT_ID)).thenReturn(3.6666);
        when(reviewRepository.countByProductId(PRODUCT_ID)).thenReturn(6L);

        reviewService.deleteReview(7L);

        verify(reviewRepository).delete(review);
        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertThat(captor.getValue().getRating()).isEqualTo(3.7); // 3.6666 → 3.7
        assertThat(captor.getValue().getReviewCount()).isEqualTo(6);
    }
}
