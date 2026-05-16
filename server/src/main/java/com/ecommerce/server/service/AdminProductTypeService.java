package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.ProductTypeRequest;
import com.ecommerce.server.models.ProductType;
import com.ecommerce.server.exception.ConflictException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.ProductRepository;
import com.ecommerce.server.repository.ProductTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductTypeService {

    private final ProductTypeRepository productTypeRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Page<ProductType> getAllProductTypes(Pageable pageable) {
        return productTypeRepository.findAll(pageable);
    }

    public ProductType createProductType(ProductTypeRequest request) {
        ProductType productType = ProductType.builder()
                .name(request.name())
                .build();
        return productTypeRepository.save(productType);
    }

    public ProductType updateProductType(Long id, ProductTypeRequest request) {
        ProductType productType = productTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductType not found"));
        productType.setName(request.name());
        return productTypeRepository.save(productType);
    }

    public void deleteProductType(Long id) {
        if (!productTypeRepository.existsById(id))
            throw new ResourceNotFoundException("ProductType not found");

        // Όπως και στα brand/category — 409 αντί για FK violation 500.
        long productCount = productRepository.countByProductTypeId(id);
        if (productCount > 0) {
            throw new ConflictException(
                    "Cannot delete product type: " + productCount + " product(s) still use it");
        }

        productTypeRepository.deleteById(id);
    }
}
