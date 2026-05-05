package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.CategoryResponse;
import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.models.Category;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.DressStyle;
import com.ecommerce.server.models.enums.ProductSort;
import com.ecommerce.server.models.enums.Size;
import com.ecommerce.server.repository.CategoryRepository;
import com.ecommerce.server.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
             ProductSort sort,
             Double minRating,
             Pageable pageable) {
         categoryRepository.findById(categoryId)
                 .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

         if (sort != null) {
             Sort s = switch (sort) {
                 case NEWEST       -> Sort.by(Sort.Direction.DESC, "createdAt");
                 case MOST_POPULAR -> Sort.by(Sort.Direction.DESC, "reviewCount");
                 case PRICE_ASC    -> Sort.by(Sort.Direction.ASC,  "price");
                 case PRICE_DESC   -> Sort.by(Sort.Direction.DESC, "price");
             };
             pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), s);
         }

         boolean filterByColors = colors != null && !colors.isEmpty();
         boolean filterBySizes  = sizes  != null && !sizes.isEmpty();
         return productRepository.findByCategoryAndFilters(
                 categoryId, minPrice, maxPrice,
                 filterByColors ? colors : List.of(Color.RED), filterByColors,
                 filterBySizes  ? sizes  : List.of(Size.M),   filterBySizes,
                 dressStyle,
                 onSale      != null && onSale,
                 bestSelling != null && bestSelling,
                 brandId, productTypeId, minRating, pageable
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

