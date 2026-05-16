package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.CategoryRequest;
import com.ecommerce.server.dto.response.CategoryResponse;
import com.ecommerce.server.models.Category;
import com.ecommerce.server.exception.ConflictException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.CategoryRepository;
import com.ecommerce.server.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.name())
                .description(request.description())
                .imageUrl(request.imageUrl())
                .build();

        return toResponse(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setName(request.name());
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());

        return toResponse(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id))
            throw new ResourceNotFoundException("Category not found");

        // Όπως και στο deleteBrand — γυρνάμε 409 αντί για 500 από FK violation.
        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new ConflictException(
                    "Cannot delete category: " + productCount + " product(s) still use it");
        }

        categoryRepository.deleteById(id);
    }

    private CategoryResponse toResponse(Category category) {
        long productCount = productRepository.countByCategoryId(category.getId());
        return new CategoryResponse(category.getId(), category.getName(),
                category.getDescription(), category.getImageUrl(), (int) productCount);
    }
}