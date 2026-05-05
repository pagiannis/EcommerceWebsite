package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.ProductTypeRequest;
import com.ecommerce.server.models.ProductType;
import com.ecommerce.server.service.AdminProductTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/product-types")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminProductTypeController {

    private final AdminProductTypeService adminProductTypeService;

    @GetMapping
    public ResponseEntity<List<ProductType>> getAllProductTypes() {
        return ResponseEntity.ok(adminProductTypeService.getAllProductTypes());
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
