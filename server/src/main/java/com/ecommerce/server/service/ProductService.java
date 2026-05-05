package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.CategoryResponse;
import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.dto.response.ProductVariantResponse;
import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.ProductImage;
import com.ecommerce.server.models.ProductVariant;
import com.ecommerce.server.models.Category;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.DressStyle;
import com.ecommerce.server.models.enums.Size;
import com.ecommerce.server.repository.CategoryRepository;
import com.ecommerce.server.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository,
                         CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    // Λήψη όλων των προϊόντων με pagination
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    // Λήψη προϊόντων κατά κατηγορία
    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        // Έλεγχος ότι υπάρχει η κατηγορία
        if (!categoryRepository.existsById(categoryId)) {
            throw new RuntimeException("Category not found");
        }

        return productRepository.findByCategoryId(categoryId, pageable)
                .map(this::convertToResponse);
    }

    // Αναζήτηση προϊόντων κατά όνομα
    public Page<ProductResponse> searchProducts(String query, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(query, pageable)
                .map(this::convertToResponse);
    }

    // Φιλτραρίσματα προϊόντων κατά τιμή
    public Page<ProductResponse> filterByPrice(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByPriceBetween(minPrice, maxPrice, pageable)
                .map(this::convertToResponse);
    }

     // Φίλτραρίσμα προϊόντων κατά κατηγορία ΚΑΙ τιμή
     public Page<ProductResponse> filterByCategoryAndPrice(Long categoryId, BigDecimal minPrice,
                                                          BigDecimal maxPrice, Pageable pageable) {
         return productRepository.findByCategoryAndPriceRange(categoryId, minPrice, maxPrice, pageable)
                 .map(this::convertToResponse);
     }

     // Φίλτραρίσμα με πολλαπλά κριτήρια (τιμή, χρώματα, μεγέθη, dress style)
     public Page<ProductResponse> getFilteredProducts(
             BigDecimal minPrice,
             BigDecimal maxPrice,
             List<Color> colors,
             List<Size> sizes,
             DressStyle dressStyle,
             Boolean onSale,
             Boolean bestSelling,
             Long brandId,
             Long productTypeId,
             Pageable pageable) {
         return productRepository.findByFilters(
                 minPrice, maxPrice, colors, sizes, dressStyle,
                 onSale != null ? onSale : false,
                 bestSelling != null ? bestSelling : false,
                 brandId, productTypeId, pageable
         ).map(this::convertToResponse);
     }

    // Λήψη λεπτομερειών ενός προϊόντος
    public ProductResponse getProductDetail(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToResponse(product);
    }

    // Λήψη όλων των variants (χρώμα + size συνδυασμοί) ενός προϊόντος
    public List<ProductVariantResponse> getProductVariants(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return product.getVariants().stream()
                .map(this::convertVariantToResponse)
                .collect(Collectors.toList());
    }

    // Λήψη όλων των κατηγοριών
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertCategoryToResponse)
                .collect(Collectors.toList());
    }

    // Λήψη κατηγορίας κατά ID
    public CategoryResponse getCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return convertCategoryToResponse(category);
    }

    // Μετατροπή Product Entity σε ProductResponse DTO
    private ProductResponse convertToResponse(Product product) {
        // Λήψη image URLs
        List<String> imageUrls = product.getImages().stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList());

        // Λήψη variants
        List<ProductVariantResponse> variants = product.getVariants().stream()
                .map(this::convertVariantToResponse)
                .collect(Collectors.toList());

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory().getName(),
                product.getBrand().getName(),
                product.getProductType().toString(),
                product.getDressStyle().toString(),
                product.getPrice(),
                product.getOriginalPrice(),
                product.getDiscountPercent(),
                product.getRating(),
                product.getReviewCount(),
                imageUrls,
                variants
        );
    }

    // Μετατροπή ProductVariant Entity σε ProductVariantResponse DTO
    private ProductVariantResponse convertVariantToResponse(ProductVariant variant) {
        return new ProductVariantResponse(
                variant.getId(),
                variant.getColor().toString(),
                variant.getSize().toString(),
                variant.getStockQuantity(),
                variant.getSku(),
                variant.getProduct().getPrice()
        );
    }

    // Μετατροπή Category Entity σε CategoryResponse DTO
    private CategoryResponse convertCategoryToResponse(Category category) {
        // Υπολογισμός πλήθους προϊόντων στη κατηγορία
        long productCount = productRepository.findByCategoryId(category.getId(), PageRequest.of(0, 1)).getTotalElements();

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getImageUrl(),
                (int) productCount
        );
    }
}

