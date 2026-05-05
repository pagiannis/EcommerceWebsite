package com.ecommerce.server.controller;

import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.dto.response.ProductVariantResponse;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.DressStyle;
import com.ecommerce.server.models.enums.Size;
import com.ecommerce.server.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController                              // ← Αυτό είναι ένα REST endpoint
@RequestMapping("/api/products")             // ← Base URL: /api/products
@CrossOrigin(origins = "http://localhost:5173")  // ← Επίτρεπε requests από το frontend (Vite)
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService){
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<Color> colors,
            @RequestParam(required = false) List<Size> filterSizes,
            @RequestParam(required = false) DressStyle dressStyle,
            @RequestParam(required = false) Boolean onSale,
            @RequestParam(required = false) Boolean bestSelling,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long productTypeId,
            @RequestParam(required = false) Boolean newArrivals) {

        return ResponseEntity.ok(productService.getFilteredProducts(
                minPrice, maxPrice, colors, filterSizes, dressStyle,
                onSale, bestSelling, brandId, productTypeId, newArrivals,
                PageRequest.of(page, size)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductDetail(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.searchProducts(query, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}/variants")
    public ResponseEntity<List<ProductVariantResponse>> getProductVariants(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductVariants(id));
    }
}