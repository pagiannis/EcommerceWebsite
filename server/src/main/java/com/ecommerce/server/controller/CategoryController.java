package com.ecommerce.server.controller;

import com.ecommerce.server.dto.response.CategoryResponse;
import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.DressStyle;
import com.ecommerce.server.models.enums.ProductSort;
import com.ecommerce.server.models.enums.Size;
import com.ecommerce.server.service.CategoryService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController                              // ← REST API endpoint
@RequestMapping("/api/categories")           // ← Base URL: /api/categories
@CrossOrigin(origins = "http://localhost:5173")  // ← Επίτρεπε requests από frontend
@RequiredArgsConstructor
@Validated
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(){
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse>  getCategoryById(@PathVariable Long id){
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

     @GetMapping("/{categoryId}/products")
     public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
             @PathVariable Long categoryId,
             @RequestParam(defaultValue = "0") @Min(0) int page,
             @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
             @RequestParam(required = false) @Min(0) BigDecimal minPrice,
             @RequestParam(required = false) @Min(0) BigDecimal maxPrice,
             @RequestParam(required = false) List<Color> colors,
             @RequestParam(required = false) List<Size> filterSizes,
             @RequestParam(required = false) DressStyle dressStyle,
             @RequestParam(required = false) Boolean onSale,
             @RequestParam(required = false) Boolean bestSelling,
             @RequestParam(required = false) String brandName,
             @RequestParam(required = false) String productTypeName,
             @RequestParam(required = false) ProductSort sort,
             @RequestParam(required = false) @Min(1) @Max(5) Double minRating) {
         return ResponseEntity.ok(categoryService.getProductsByCategoryWithFilters(
                 categoryId, minPrice, maxPrice, colors, filterSizes, dressStyle,
                 onSale, bestSelling, brandName, productTypeName, sort, minRating,
                 PageRequest.of(page, size)
         ));
     }
}
