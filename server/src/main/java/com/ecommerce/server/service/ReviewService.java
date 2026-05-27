package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.ReviewRequest;
import com.ecommerce.server.dto.response.ReviewResponse;
import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.Review;
import com.ecommerce.server.models.User;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.ProductRepository;
import com.ecommerce.server.repository.ReviewRepository;
import com.ecommerce.server.repository.UserRepository;
import com.ecommerce.server.security.AuthUser;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviews(Long productId, String sort, Integer minRating) {
        Sort jpaSort = switch (sort != null ? sort : "LATEST") {
            case "OLDEST"        -> Sort.by(Sort.Direction.ASC,  "createdAt");
            case "HIGHEST_RATING"-> Sort.by(Sort.Direction.DESC, "rating");
            case "LOWEST_RATING" -> Sort.by(Sort.Direction.ASC,  "rating");
            default              -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        int effectiveMin = (minRating != null && minRating > 0) ? minRating : 0;

        return reviewRepository.findByProductIdAndRatingGreaterThanEqual(productId, effectiveMin, jpaSort)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Λήψη reviews χρήστη
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviews(Long userId) {
        return reviewRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Δημιουργία κριτικής
     */
    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Δημιουργία review
        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Ενημέρωση product rating και review count
        updateProductRating(product.getId());

        return toResponse(savedReview);
    }

    /**
     * Διαγραφή κριτικής. Ο controller έχει @PreAuthorize για ownership, αλλά
     * κρατάμε και service-level guard ως defense in depth — ίδιο pattern με
     * το requireCartItemOwner στο CartService. Αν κληθεί από άλλο service
     * ή scheduler χωρίς bean validation, πάλι αρνούμαστε.
     */
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        requireReviewOwner(review);

        Long productId = review.getProduct().getId();
        reviewRepository.delete(review);

        updateProductRating(productId);
    }

    private void requireReviewOwner(Review review) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthUser user)
                || !review.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }
    }

    // Ownership check για χρήση από @PreAuthorize SpEL:
    //   @PreAuthorize("@reviewService.isReviewOwner(#reviewId)")
    @Transactional(readOnly = true)
    public boolean isReviewOwner(Long reviewId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthUser user)) {
            return false;
        }
        return reviewRepository.findById(reviewId)
                .map(r -> r.getUser().getId().equals(user.getId()))
                .orElse(false);
    }


    /**
     * Ξανα-υπολογίζει το rating και reviewCount του product με ένα atomic
     * UPDATE στη βάση. Αυτό αποφεύγει το race condition του παλιού pattern
     * (fetch → set → save) όταν 2 χρήστες αφήνουν review ταυτόχρονα: το
     * row lock σειριοποιεί τα UPDATEs και κάθε ένα βλέπει το committed
     * insert του προηγούμενου.
     */
    private void updateProductRating(Long productId) {
        productRepository.recalculateRatingAndCount(productId);
    }

    // Μετατροπή Review Entity σε ReviewResponse DTO
    private ReviewResponse toResponse(Review review) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String createdAt = review.getCreatedAt().format(formatter);

        return new ReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                review.getUser().getFirstName() + " " + review.getUser().getLastName(),
                review.getRating(),
                review.getComment(),
                createdAt
        );
    }
}

