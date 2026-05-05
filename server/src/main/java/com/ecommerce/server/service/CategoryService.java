package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.CategoryResponse;
import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.models.Category;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.DressStyle;
import com.ecommerce.server.models.enums.Size;
import com.ecommerce.server.repository.CategoryRepository;
import com.ecommerce.server.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    // Φέρνει όλες τις κατηγορίες με πλήθος προϊόντων
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToResponse)
                .toList();
    }

    // Φέρνει μία κατηγορία με βάση το ID
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return convertToResponse(category);
    }

     // Φέρνει προϊόντα μιας κατηγορίας με φίλτρα και pagination
     public Page<ProductResponse> getProductsByCategoryWithFilters(
             Long categoryId,
             BigDecimal minPrice,
             BigDecimal maxPrice,
             List<Color> colors,
             List<Size> sizes,
             DressStyle dressStyle,
             Boolean onSale,
             Boolean bestSelling,
             Long brandId,
             Long productTypeId,
             Pageable pageable) {
         // Έλεγχος αν η κατηγορία υπάρχει
         categoryRepository.findById(categoryId)
                 .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

         // Φέρνει προϊόντα της κατηγορίας με φίλτρα
         return productRepository.findByCategoryAndFilters(
                 categoryId, minPrice, maxPrice, colors, sizes, dressStyle,
                 onSale != null ? onSale : false,
                 bestSelling != null ? bestSelling : false,
                 brandId, productTypeId, pageable
         ).map(productService::convertToResponse);
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

