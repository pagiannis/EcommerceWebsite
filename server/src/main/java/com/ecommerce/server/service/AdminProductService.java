package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.ProductRequest;
import com.ecommerce.server.dto.request.ProductVariantRequest;
import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.dto.response.ProductVariantResponse;
import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.ProductVariant;
import java.time.LocalDateTime;
import com.ecommerce.server.exception.ConflictException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductTypeRepository productTypeRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;

    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .category(categoryRepository.findById(request.categoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found")))
                .brand(brandRepository.findById(request.brandId())
                        .orElseThrow(() -> new ResourceNotFoundException("Brand not found")))
                .productType(productTypeRepository.findById(request.productTypeId())
                        .orElseThrow(() -> new ResourceNotFoundException("ProductType not found")))
                .dressStyle(request.dressStyle())
                .price(request.price())
                .originalPrice(request.originalPrice())
                .discountPercent(request.discountPercent())
                .createdAt(LocalDateTime.now())
                .build();

        return productService.convertToResponse(productRepository.save(product));
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setCategory(categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found")));
        product.setBrand(brandRepository.findById(request.brandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found")));
        product.setProductType(productTypeRepository.findById(request.productTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductType not found")));
        product.setDressStyle(request.dressStyle());
        product.setPrice(request.price());
        product.setOriginalPrice(request.originalPrice());
        product.setDiscountPercent(request.discountPercent());

        return productService.convertToResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id))
            throw new ResourceNotFoundException("Product not found");
        productRepository.deleteById(id);
    }

    public ProductVariantResponse addVariant(Long productId, ProductVariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .color(request.color())
                .size(request.size())
                .stockQuantity(request.stockQuantity())
                .sku(request.sku())
                .build();

        return toVariantResponse(productVariantRepository.save(variant), product.getPrice());
    }

    public ProductVariantResponse updateVariant(Long variantId, ProductVariantRequest request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        variant.setColor(request.color());
        variant.setSize(request.size());
        variant.setStockQuantity(request.stockQuantity());
        variant.setSku(request.sku());

        return toVariantResponse(productVariantRepository.save(variant), variant.getProduct().getPrice());
    }

    public void deleteVariant(Long variantId) {
        if (!productVariantRepository.existsById(variantId))
            throw new ResourceNotFoundException("Variant not found");

        // Block μόνο αν υπάρχει σε ενεργό cart κάποιου χρήστη — αλλιώς το
        // FK constraint πετάει 500. Παλιά OrderItems έχουν snapshot fields
        // (productName, priceAtPurchase, color, size) και επιβιώνουν χωρίς
        // το variant: η reorder ήδη χειρίζεται variant==null.
        long cartUsage = cartItemRepository.countByVariantId(variantId);
        if (cartUsage > 0) {
            throw new ConflictException(
                    "Cannot delete variant: it is currently in " + cartUsage + " user cart(s)");
        }

        productVariantRepository.deleteById(variantId);
    }

    private ProductVariantResponse toVariantResponse(ProductVariant v, java.math.BigDecimal price) {
        return new ProductVariantResponse(v.getId(), v.getColor().toString(),
                v.getColor().getHexCode(), v.getSize().toString(), v.getStockQuantity(), v.getSku(), price);
    }
}