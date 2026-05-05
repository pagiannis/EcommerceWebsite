package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.BrandRequest;
import com.ecommerce.server.models.Brand;
import com.ecommerce.server.service.AdminBrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/brands")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminBrandController {

    private final AdminBrandService adminBrandService;

    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        return ResponseEntity.ok(adminBrandService.getAllBrands());
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
