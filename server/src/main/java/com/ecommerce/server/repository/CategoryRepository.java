package com.ecommerce.server.repository;

import com.ecommerce.server.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    /**
     * Επιστρέφει όλες τις κατηγορίες μαζί με το πλήθος των προϊόντων τους
     * σε ΕΝΑ query (αντί για findAll + N counts). Κάθε row: [id, name, description, imageUrl, count].
     */
    @Query("""
            SELECT c.id, c.name, c.description, c.imageUrl, COUNT(p)
            FROM Category c
            LEFT JOIN Product p ON p.category = c
            GROUP BY c.id, c.name, c.description, c.imageUrl
            ORDER BY c.id
            """)
    List<Object[]> findAllWithProductCount();
}
