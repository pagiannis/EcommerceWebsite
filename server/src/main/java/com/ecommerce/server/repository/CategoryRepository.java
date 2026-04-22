package com.ecommerce.server.repository;

import com.ecommerce.server.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByParentIsNull(); // μόνο top-level categories
    List<Category> findByParentId(Long parentId);
}
