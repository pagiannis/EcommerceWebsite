package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.dto.response.ProductSuggestionResponse;
import com.ecommerce.server.dto.response.ProductVariantResponse;
import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.ProductImage;
import com.ecommerce.server.models.ProductVariant;
import com.ecommerce.server.models.enums.Color;
import com.ecommerce.server.models.enums.DressStyle;
import com.ecommerce.server.models.enums.ProductSort;
import com.ecommerce.server.models.enums.Size;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductResponse> getFilteredProducts(
            String categoryName,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            List<Color> colors,
            List<Size> sizes,
            DressStyle dressStyle,
            Boolean onSale,
            Boolean bestSelling,
            Boolean topSelling,
            String brandName,
            String productTypeName,
            ProductSort sort,
            Double minRating,
            Pageable pageable) {

        boolean filterByColors = colors != null && !colors.isEmpty();
        boolean filterBySizes  = sizes  != null && !sizes.isEmpty();

        String normalizedCategory    = categoryName    != null ? categoryName.toLowerCase()    : null;
        String normalizedBrand       = brandName       != null ? brandName.toLowerCase()       : null;
        String normalizedProductType = productTypeName != null ? productTypeName.toLowerCase() : null;

        if (topSelling != null && topSelling) {
            return productRepository.findTopSellingProducts(
                    normalizedCategory, minPrice, maxPrice,
                    filterByColors ? colors : List.of(Color.RED), filterByColors,
                    filterBySizes  ? sizes  : List.of(Size.M),   filterBySizes,
                    dressStyle,
                    onSale      != null && onSale,
                    bestSelling != null && bestSelling,
                    normalizedBrand, normalizedProductType, minRating, pageable
            ).map(this::convertToResponse);
        }

        if (sort != null) {
            Sort s = switch (sort) {
                case NEWEST       -> Sort.by(Sort.Direction.DESC, "createdAt");
                case MOST_POPULAR -> Sort.by(Sort.Direction.DESC, "reviewCount");
                case PRICE_ASC    -> Sort.by(Sort.Direction.ASC,  "price");
                case PRICE_DESC   -> Sort.by(Sort.Direction.DESC, "price");
            };
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), s);
        }

        return productRepository.findByFilters(
                normalizedCategory,
                minPrice, maxPrice,
                filterByColors ? colors : List.of(Color.RED), filterByColors,
                filterBySizes  ? sizes  : List.of(Size.M),   filterBySizes,
                dressStyle,
                onSale      != null && onSale,
                bestSelling != null && bestSelling,
                normalizedBrand, normalizedProductType, minRating, pageable
        ).map(this::convertToResponse);
    }

    public Page<ProductResponse> searchProducts(String query, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(query, pageable)
                .map(this::convertToResponse);
    }

    public List<ProductSuggestionResponse> autocomplete(String query) {
        return productRepository.findTop8ByNameStartingWithIgnoreCase(query)
                .stream()
                .map(p -> new ProductSuggestionResponse(
                        p.getId(),
                        p.getName(),
                        p.getImages().isEmpty() ? null : p.getImages().get(0).getImageUrl()
                ))
                .toList();
    }

    public ProductResponse getProductDetail(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return convertToResponse(product);
    }

    public List<ProductVariantResponse> getProductVariants(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return product.getVariants().stream()
                .map(this::convertVariantToResponse)
                .toList();
    }

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

    private ProductVariantResponse convertVariantToResponse(ProductVariant variant) {
        return new ProductVariantResponse(
                variant.getId(),
                variant.getColor().toString(),
                variant.getColor().getHexCode(),
                variant.getSize().toString(),
                variant.getStockQuantity(),
                variant.getSku(),
                variant.getProduct().getPrice()
        );
    }
}