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
 * Μετά την atomic recalculation, η rating/count λογική γίνεται στη βάση
 * (ProductRepository.recalculateRatingAndCount). Άρα εδώ ελέγχουμε:
 *  - το service καλεί τη σωστή atomic query μετά από create/delete
 *  - δεν ξαναγυρίζει στο παλιό fetch-set-save pattern (regression)
 *  - failure modes (user/product/review not found)
 *
 * Η ίδια η rounding/count λογική επαληθεύεται σε integration επίπεδο
 * (βλ. ReviewServiceIntegrationTest).
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
    //   createReview
    // ====================================================================

    @Test
    @DisplayName("createReview: αποθηκεύει review και ζητάει atomic recalc του product rating")
    void createReview_persistsAndTriggersRecalculation() {
        ReviewRequest request = new ReviewRequest(PRODUCT_ID, 5, "Great");

        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(testProduct));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(42L);
            r.setCreatedAt(LocalDateTime.now());
            return r;
        });

        ReviewResponse response = reviewService.createReview(USER_ID, request);

        assertThat(response.id()).isEqualTo(42L);
        assertThat(response.rating()).isEqualTo(5);
        verify(productRepository).recalculateRatingAndCount(PRODUCT_ID);
    }

    @Test
    @DisplayName("createReview: regression — ΔΕΝ ξαναγυρνά σε fetch/set/save στο Product")
    void createReview_doesNotUseOldFetchSetSavePattern() {
        ReviewRequest request = new ReviewRequest(PRODUCT_ID, 4, "");

        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(testProduct));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

        reviewService.createReview(USER_ID, request);

        // Το παλιό pattern έκανε save() στο product και count στα reviews.
        // Τώρα ΟΛΑ γίνονται μέσω της atomic query.
        verify(productRepository, never()).save(any());
        verify(reviewRepository, never()).countByProductId(any());
        verify(reviewRepository, never()).findAverageRatingByProductId(any());
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
        verify(productRepository, never()).recalculateRatingAndCount(any());
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
        verify(productRepository, never()).recalculateRatingAndCount(any());
    }

    // ====================================================================
    //   deleteReview — και αυτή πρέπει να triggerάρει recalculation
    // ====================================================================

    @Test
    @DisplayName("deleteReview: διαγράφει review και triggerάρει atomic recalc")
    void deleteReview_triggersRecalculation() {
        Review review = Review.builder()
                .id(7L).user(testUser).product(testProduct).rating(2).build();

        when(reviewRepository.findById(7L)).thenReturn(Optional.of(review));

        reviewService.deleteReview(7L);

        verify(reviewRepository).delete(review);
        verify(productRepository).recalculateRatingAndCount(PRODUCT_ID);
    }

    @Test
    @DisplayName("deleteReview: άγνωστο review → ResourceNotFoundException, δεν τρέχει recalc")
    void deleteReview_notFound_throws() {
        when(reviewRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.deleteReview(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(reviewRepository, never()).delete(any());
        verify(productRepository, never()).recalculateRatingAndCount(any());
    }
}
