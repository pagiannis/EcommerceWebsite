package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.CategoryResponse;
import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.dto.response.ProductVariantResponse;
import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.ProductImage;
import com.ecommerce.server.models.ProductVariant;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.DressStyle;
import com.ecommerce.server.models.enums.Size;
import com.ecommerce.server.repository.CategoryRepository;
import com.ecommerce.server.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
@RequiredArgsConstructor
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // Φίλτραρίσμα με πολλαπλά κριτήρια
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
            Boolean newArrivals,
            Pageable pageable) {
        if (Boolean.TRUE.equals(newArrivals))
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt"));
        boolean filterByColors = colors != null && !colors.isEmpty();
        boolean filterBySizes  = sizes  != null && !sizes.isEmpty();
        return productRepository.findByFilters(
                minPrice, maxPrice,
                filterByColors ? colors : List.of(Color.RED), filterByColors,
                filterBySizes  ? sizes  : List.of(Size.M),   filterBySizes,
                dressStyle,
                onSale      != null && onSale,
                bestSelling != null && bestSelling,
                brandId, productTypeId, pageable
        ).map(this::convertToResponse);
    }

    // Αναζήτηση προϊόντων κατά όνομα
    public Page<ProductResponse> searchProducts(String query, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(query, pageable)
                .map(this::convertToResponse);
    }

    // Λήψη λεπτομερειών ενός προϊόντος
    public ProductResponse getProductDetail(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToResponse(product);
    }

    // Λήψη όλων των variants
    public List<ProductVariantResponse> getProductVariants(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return product.getVariants().stream()
                .map(this::convertVariantToResponse)
                .toList();
    }

    // Μετατροπή Product Entity σε ProductResponse DTO
    public ProductResponse convertToResponse(Product product) {
        List<String> imageUrls = product.getImages().stream()
                .map(ProductImage::getImageUrl)
                .toList();

        List<ProductVariantResponse> variants = product.getVariants().stream()
                .map(this::convertVariantToResponse)
                .toList();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory().getName(),
                product.getBrand().getName(),
                product.getProductType().getName(),
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
}
