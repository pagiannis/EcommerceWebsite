package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.AppReviewRequest;
import com.ecommerce.server.dto.response.AppReviewResponse;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.models.AppReview;
import com.ecommerce.server.models.User;
import com.ecommerce.server.repository.AppReviewRepository;
import com.ecommerce.server.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppReviewService {

    private final AppReviewRepository appReviewRepository;
    private final UserRepository userRepository;

    public AppReviewService(AppReviewRepository appReviewRepository,
                          UserRepository userRepository) {
        this.appReviewRepository = appReviewRepository;
        this.userRepository = userRepository;
    }

    public List<AppReviewResponse> getFeaturedReviews() {
        return appReviewRepository.findByApprovedOrderByCreatedAtDesc(true)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Λήψη όλων των εγκεκριμένων reviews
     */
    public List<AppReviewResponse> getApprovedReviews() {
        return appReviewRepository.findByApprovedOrderByCreatedAtDesc(true)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Λήψη reviews χρήστη
     */
    public List<AppReviewResponse> getUserReviews(Long userId) {
        return appReviewRepository.findByUserId(userId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Δημιουργία νέας κριτικής εφαρμογής
     */
    @Transactional
    public AppReviewResponse submitReview(Long userId, AppReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AppReview appReview = AppReview.builder()
                .user(user)
                .rating(request.rating())
                .comment(request.comment())
                .approved(false)
                .build();

        return convertToResponse(appReviewRepository.save(appReview));
    }

    /**
     * Admin: Έγκριση κριτικής
     */
    @Transactional
    public AppReviewResponse approveReview(Long reviewId) {
        AppReview appReview = appReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        appReview.setApproved(true);
        return convertToResponse(appReviewRepository.save(appReview));
    }

    /**
     * Διαγραφή κριτικής
     */
    @Transactional
    public void deleteReview(Long reviewId) {
        AppReview appReview = appReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        appReviewRepository.delete(appReview);
    }

    // Μετατροπή AppReview Entity σε AppReviewResponse DTO
    private AppReviewResponse convertToResponse(AppReview appReview) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String createdAt = appReview.getCreatedAt().format(formatter);

        return new AppReviewResponse(
                appReview.getId(),
                appReview.getUser().getFirstName() + " " + appReview.getUser().getLastName(),
                appReview.getRating(),
                appReview.getComment(),
                createdAt,
                appReview.isApproved()
        );
    }
}

