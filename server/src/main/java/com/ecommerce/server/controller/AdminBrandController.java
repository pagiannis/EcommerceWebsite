package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.BrandRequest;
import com.ecommerce.server.models.Brand;
import com.ecommerce.server.service.AdminBrandService;
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
@RequestMapping("/api/admin/brands")
@RequiredArgsConstructor
@Validated
public class AdminBrandController {

    private final AdminBrandService adminBrandService;

    @GetMapping
    public ResponseEntity<Page<Brand>> getAllBrands(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(adminBrandService.getAllBrands(PageRequest.of(page, size)));
    }

    @PostMapping
    public ResponseEntity<Brand> createBrand(@Valid @RequestBody BrandRequest request) {
        return new ResponseEntity<>(adminBrandService.createBrand(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Brand> updateBrand(@PathVariable Long id, @Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(adminBrandService.updateBrand(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        adminBrandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}
