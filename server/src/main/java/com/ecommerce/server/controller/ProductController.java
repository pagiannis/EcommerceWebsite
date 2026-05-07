package com.ecommerce.server.controller;

import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.dto.response.ProductSuggestionResponse;
import com.ecommerce.server.dto.response.ProductVariantResponse;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.DressStyle;
import com.ecommerce.server.models.enums.ProductSort;
import com.ecommerce.server.models.enums.Size;
import com.ecommerce.server.service.ProductService;
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

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@Validated
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "9") @Min(1) @Max(100) int size,
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

        return ResponseEntity.ok(productService.getFilteredProducts(
                category, minPrice, maxPrice, colors, filterSizes, dressStyle,
                onSale, bestSelling, brandName, productTypeName, sort, minRating,
                PageRequest.of(page, size)
        ));
    }

    @GetMapping("/top-selling")
    public ResponseEntity<List<ProductResponse>> getTopSellingProducts(
            @RequestParam(defaultValue = "8") @Min(1) @Max(20) int limit) {
        return ResponseEntity.ok(productService.getTopSellingProducts(limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductDetail(id));
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<ProductSuggestionResponse>> autocomplete(@RequestParam String query) {
        return ResponseEntity.ok(productService.autocomplete(query));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "9") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(productService.searchProducts(query, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}/variants")
    public ResponseEntity<List<ProductVariantResponse>> getProductVariants(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductVariants(id));
    }
}
