package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.ProductTypeRequest;
import com.ecommerce.server.models.ProductType;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.ProductTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminProductTypeService {

    private final ProductTypeRepository productTypeRepository;

    public List<ProductType> getAllProductTypes() {
        return productTypeRepository.findAll();
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
        productTypeRepository.deleteById(id);
    }
}
