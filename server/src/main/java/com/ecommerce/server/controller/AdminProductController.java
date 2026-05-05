package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.ProductRequest;
import com.ecommerce.server.dto.request.ProductVariantRequest;
import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.dto.response.ProductVariantResponse;
import com.ecommerce.server.service.AdminProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        return new ResponseEntity<>(adminProductService.createProduct(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id,
                                                         @RequestBody ProductRequest request) {
        return ResponseEntity.ok(adminProductService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        adminProductService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{productId}/variants")
    public ResponseEntity<ProductVariantResponse> addVariant(@PathVariable Long productId,
                                                             @RequestBody ProductVariantRequest request) {
        return new ResponseEntity<>(adminProductService.addVariant(productId, request), HttpStatus.CREATED);
    }

    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ProductVariantResponse> updateVariant(@PathVariable Long variantId,
                                                                @RequestBody ProductVariantRequest request) {
        return ResponseEntity.ok(adminProductService.updateVariant(variantId, request));
    }

    @DeleteMapping("/variants/{variantId}")
    public ResponseEntity<Void> deleteVariant(@PathVariable Long variantId) {
        adminProductService.deleteVariant(variantId);
        return ResponseEntity.noContent().build();
    }
}