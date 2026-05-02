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

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Λήψη όλων των προϊόντων με pagination
     * GET /api/products?page=0&size=20
     */
    @GetMapping
    public Page<ProductResponse> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.getAllProducts(PageRequest.of(page, size));
    }

    /**
     * Λήψη προϊόντος κατά ID
     * GET /api/products/{id}
     */
    @GetMapping("/{id}")
    public ProductResponse getProductDetail(@PathVariable Long id) {
        return productService.getProductDetail(id);
    }

    /**
     * Αναζήτηση προϊόντων κατά όνομα
     * GET /api/products/search?query=shirt&page=0&size=20
     */
    @GetMapping("/search/products")
    public Page<ProductResponse> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.searchProducts(query, PageRequest.of(page, size));
    }

    /**
     * Φιλτραρίσματα προϊόντων κατά κατηγορία
     * GET /api/products/category/{categoryId}?page=0&size=20
     */
    @GetMapping("/category/{categoryId}")
    public Page<ProductResponse> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.getProductsByCategory(categoryId, PageRequest.of(page, size));
    }

    /**
     * Φιλτραρίσματα προϊόντων κατά τιμή
     * GET /api/products/filter/price?minPrice=10&maxPrice=100&page=0&size=20
     */
    @GetMapping("/filter/price")
    public Page<ProductResponse> filterByPrice(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.filterByPrice(minPrice, maxPrice, PageRequest.of(page, size));
    }

    /**
     * Φιλτραρίσματα προϊόντων κατά κατηγορία ΚΑΙ τιμή
     * GET /api/products/filter?categoryId=1&minPrice=10&maxPrice=100&page=0&size=20
     */
    @GetMapping("/filter")
    public Page<ProductResponse> filterByCategoryAndPrice(
            @RequestParam Long categoryId,
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productService.filterByCategoryAndPrice(categoryId, minPrice, maxPrice, PageRequest.of(page, size));
    }

    /**
     * Λήψη όλων των variants (χρώμα + size συνδυασμοί) ενός προϊόντος
     * GET /api/products/{id}/variants
     */
    @GetMapping("/{id}/variants")
    public List<ProductVariantResponse> getProductVariants(@PathVariable Long id) {
        return productService.getProductVariants(id);
    }

    /**
     * Λήψη όλων των κατηγοριών
     * GET /api/categories
     */
    @GetMapping("/categories/all")
    public List<CategoryResponse> getAllCategories() {
        return productService.getAllCategories();
    }

    /**
     * Λήψη κατηγορίας κατά ID
     * GET /api/categories/{id}
     */
    @GetMapping("/categories/{id}")
    public CategoryResponse getCategory(@PathVariable Long id) {
        return productService.getCategory(id);
    }
}



