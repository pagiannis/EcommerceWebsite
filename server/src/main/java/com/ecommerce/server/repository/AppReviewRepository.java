package com.ecommerce.server.repository;

import com.ecommerce.server.models.AppReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppReviewRepository extends JpaRepository<AppReview, Long> {
    List<AppReview> findByApprovedOrderByCreatedAtDesc(boolean approved);
    List<AppReview> findByUserId(Long userId);
}

