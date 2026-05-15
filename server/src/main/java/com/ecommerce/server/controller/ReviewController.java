package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.ReviewRequest;
import com.ecommerce.server.dto.response.ReviewResponse;
import com.ecommerce.server.service.ReviewService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Validated
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewResponse>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId, sort, minRating, page, size));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponse>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getUserReviews(userId));
    }

    @PostMapping("/user/{userId}")
    @PreAuthorize("#userId == authentication.principal.id")
    public ResponseEntity<ReviewResponse> createReview(@PathVariable Long userId,
                                                       @Valid @RequestBody ReviewRequest request) {
        return new ResponseEntity<>(reviewService.createReview(userId, request), HttpStatus.CREATED);
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("@reviewService.isReviewOwner(#reviewId)")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
