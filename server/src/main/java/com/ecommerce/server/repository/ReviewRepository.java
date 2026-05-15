package com.ecommerce.server.repository;

import com.ecommerce.server.models.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Paginated reviews ενός product, φιλτραρισμένα κατά rating. Το
    // convertToResponse του service καλεί review.getUser().getFirstName() —
    // χωρίς JOIN FETCH θα είχαμε N+1. Με fetch, ένα SQL για την σελίδα.
    //
    // countQuery: χωρίς JOIN FETCH (η Hibernate δεν την επιτρέπει σε counts)
    // και χωρίς JOIN στο user — μετράμε μόνο τα reviews που ταιριάζουν.
    @Query(value = """
        SELECT r FROM Review r
        JOIN FETCH r.user
        WHERE r.product.id = :productId
          AND r.rating >= :minRating
        """,
        countQuery = """
        SELECT COUNT(r) FROM Review r
        WHERE r.product.id = :productId
          AND r.rating >= :minRating
        """)
    Page<Review> findByProductIdAndRatingGreaterThanEqual(
            @Param("productId") Long productId,
            @Param("minRating") Integer minRating,
            Pageable pageable);

    // Reviews ενός user σε όλα τα products. Το convertToResponse καλεί
    // review.getProduct().getId() — εδώ τα products διαφέρουν ανά review,
    // οπότε JOIN FETCH product για αποφυγή N+1.
    @Query("""
        SELECT r FROM Review r
        JOIN FETCH r.product
        WHERE r.user.id = :userId
        """)
    List<Review> findByUserId(@Param("userId") Long userId);

    // SELECT COUNT(*) — δεν φορτώνει τα Review entities στη μνήμη.
    long countByProductId(Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);
}