package com.ecommerce.server.controller;

import com.ecommerce.server.dto.response.CategoryResponse;
import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.dto.response.ProductVariantResponse;
import com.ecommerce.server.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    public Page<ProductResponse> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size){
     return productService.getAllProducts(PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public ProductResponse getProductById(@PathVariable Long id) {
        return productService.getProductDetail(id);
    }

    @GetMapping("/category/{categoryId}")
    public Page<ProductResponse> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.getProductsByCategory(categoryId, PageRequest.of(page, size));
    }

    @GetMapping("/search")
    public Page<ProductResponse> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.searchProducts(query, PageRequest.of(page, size));
    }

    @GetMapping("/{id}/variants")
    public List<ProductVariantResponse> getProductVariants(@PathVariable Long id) {
        return productService.getProductVariants(id);
    }
}