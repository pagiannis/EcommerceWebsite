package com.ecommerce.server.controller;

import com.ecommerce.server.dto.response.AppReviewResponse;
import com.ecommerce.server.service.AppReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/app-reviews")
@RequiredArgsConstructor
public class AdminAppReviewController {

    private final AppReviewService appReviewService;

    @GetMapping
    public ResponseEntity<List<AppReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(appReviewService.getApprovedReviews());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<AppReviewResponse> approveReview(@PathVariable Long id) {
        return ResponseEntity.ok(appReviewService.approveReview(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        appReviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
