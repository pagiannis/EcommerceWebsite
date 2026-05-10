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
        return categoryRepository.findAll().stream()
                .map(this::convertToResponse)
                .toList();
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return convertToResponse(category);
    }

    private CategoryResponse convertToResponse(Category category) {
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