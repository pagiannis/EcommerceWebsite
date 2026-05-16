package com.ecommerce.server.repository;

import com.ecommerce.server.models.AppReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppReviewRepository extends JpaRepository<AppReview, Long> {

    // convertToResponse του service αγγίζει user.getFirstName()/getLastName() —
    // χωρίς JOIN FETCH θα είχαμε N+1 ανά κριτική. Το homepage testimonials
    // section εμφανίζεται σε κάθε visit, οπότε η βελτιστοποίηση αξίζει.
    @Query("""
        SELECT a FROM AppReview a
        JOIN FETCH a.user
        WHERE a.approved = :approved
        ORDER BY a.createdAt DESC
        """)
    List<AppReview> findByApprovedOrderByCreatedAtDesc(@Param("approved") boolean approved);

    @Query("""
        SELECT a FROM AppReview a
        JOIN FETCH a.user
        WHERE a.user.id = :userId
        """)
    List<AppReview> findByUserId(@Param("userId") Long userId);

    // Admin view: ΟΛΕΣ τις κριτικές με hydrated user — αλλιώς ο admin
    // panel θα έκανε N+1 για κάθε νέα κριτική στη λίστα.
    @Query("""
        SELECT a FROM AppReview a
        JOIN FETCH a.user
        ORDER BY a.createdAt DESC
        """)
    List<AppReview> findAllWithUser();
}

