package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.ProductTypeRequest;
import com.ecommerce.server.models.ProductType;
import com.ecommerce.server.service.AdminProductTypeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/product-types")
@RequiredArgsConstructor
@Validated
public class AdminProductTypeController {

    private final AdminProductTypeService adminProductTypeService;

    @GetMapping
    public ResponseEntity<Page<ProductType>> getAllProductTypes(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(adminProductTypeService.getAllProductTypes(PageRequest.of(page, size)));
    }

    @PostMapping
    public ResponseEntity<ProductType> createProductType(@Valid @RequestBody ProductTypeRequest request) {
        return new ResponseEntity<>(adminProductTypeService.createProductType(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductType> updateProductType(@PathVariable Long id, @Valid @RequestBody ProductTypeRequest request) {
        return ResponseEntity.ok(adminProductTypeService.updateProductType(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductType(@PathVariable Long id) {
        adminProductTypeService.deleteProductType(id);
        return ResponseEntity.noContent().build();
    }
}
