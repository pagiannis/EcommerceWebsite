package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.CategoryResponse;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.models.Category;
import com.ecommerce.server.repository.CategoryRepository;
import com.ecommerce.server.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<CategoryResponse> getAllCategories() {
        // Single GROUP BY query — αποφεύγει το N+1 (1 + N counts) που υπήρχε με findAll().
        return categoryRepository.findAllWithProductCount().stream()
                .map(row -> new CategoryResponse(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        ((Long) row[4]).intValue()
                ))
                .toList();
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        long productCount = productRepository.countByCategoryId(category.getId());
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getImageUrl(),
                (int) productCount
        );
    }
}