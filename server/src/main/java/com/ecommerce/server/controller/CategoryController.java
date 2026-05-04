package com.ecommerce.server.controller;

import com.ecommerce.server.dto.response.CategoryResponse;
import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController                              // ← REST API endpoint
@RequestMapping("/api/categories")           // ← Base URL: /api/categories
@CrossOrigin(origins = "http://localhost:5173")  // ← Επίτρεπε requests από frontend
@RequiredArgsConstructor
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
    public ResponseEntity<Page<ProductResponse>>  getProductsByCategory(@PathVariable Long categoryId,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "20") int size){
        return ResponseEntity.ok(categoryService.getProductsByCategory(categoryId, PageRequest.of(page, size))) ;
    }
}

