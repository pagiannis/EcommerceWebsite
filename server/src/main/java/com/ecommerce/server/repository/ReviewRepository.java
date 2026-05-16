package com.ecommerce.server.repository;

import com.ecommerce.server.models.Review;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Reviews ενός product, φιλτραρισμένα κατά rating. Το convertToResponse
    // του service καλεί review.getUser().getFirstName() — χωρίς JOIN FETCH θα
    // είχαμε N+1 (1 query reviews + 1 query/review για user). Με fetch, ένα SQL.
    @Query("""
        SELECT r FROM Review r
        JOIN FETCH r.user
        WHERE r.product.id = :productId
          AND r.rating >= :minRating
        """)
    List<Review> findByProductIdAndRatingGreaterThanEqual(
            @Param("productId") Long productId,
            @Param("minRating") Integer minRating,
            Sort sort);

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