package com.ecommerce.server.controller;

import com.ecommerce.server.service.ProductService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {//sxolio

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }


}



