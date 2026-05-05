package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.AppReviewRequest;
import com.ecommerce.server.dto.response.AppReviewResponse;
import com.ecommerce.server.service.AppReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/app-reviews")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AppReviewController {

    private final AppReviewService appReviewService;

    @GetMapping("/featured")
    public ResponseEntity<List<AppReviewResponse>> getFeaturedReviews() {
        return ResponseEntity.ok(appReviewService.getFeaturedReviews());
    }

    @GetMapping
    public ResponseEntity<List<AppReviewResponse>> getApprovedReviews() {
        return ResponseEntity.ok(appReviewService.getApprovedReviews());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AppReviewResponse>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(appReviewService.getUserReviews(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<AppReviewResponse> submitReview(@PathVariable Long userId,
                                                          @Valid @RequestBody AppReviewRequest request) {
        return new ResponseEntity<>(appReviewService.submitReview(userId, request), HttpStatus.CREATED);
    }
}
