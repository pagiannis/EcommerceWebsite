package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.ReviewRequest;
import com.ecommerce.server.dto.response.ReviewResponse;
import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.Review;
import com.ecommerce.server.models.User;
import com.ecommerce.server.repository.ProductRepository;
import com.ecommerce.server.repository.ReviewRepository;
import com.ecommerce.server.repository.UserRepository;
import org.springframework.data.domain.Sort;
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
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Λήψη reviews χρήστη
     */
    public List<ReviewResponse> getUserReviews(Long userId) {
        return reviewRepository.findByUserId(userId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Δημιουργία κριτικής
     */
    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

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

        return convertToResponse(savedReview);
    }

    /**
     * Διαγραφή κριτικής
     */
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        Long productId = review.getProduct().getId();
        reviewRepository.delete(review);

        // Ενημέρωση rating
        updateProductRating(productId);
    }

    /**
     * Ενημέρωση μέσου rating προϊόντος
     */
    private void updateProductRating(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Double avgRating = reviewRepository.findAverageRatingByProductId(productId);
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);

        product.setRating(avgRating != null ? avgRating : 0.0);
        product.setReviewCount(reviews.size());
        product.setUpdatedAt(java.time.LocalDateTime.now());

        productRepository.save(product);
    }

    // Μετατροπή Review Entity σε ReviewResponse DTO
    private ReviewResponse convertToResponse(Review review) {
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

