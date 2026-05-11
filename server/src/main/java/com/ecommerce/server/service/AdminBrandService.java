package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.BrandRequest;
import com.ecommerce.server.models.Brand;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminBrandService {

    private final BrandRepository brandRepository;

    @Transactional(readOnly = true)
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand createBrand(BrandRequest request) {
        Brand brand = Brand.builder()
                .name(request.name())
                .logoUrl(request.logoUrl())
                .build();
        return brandRepository.save(brand);
    }

    public Brand updateBrand(Long id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        brand.setName(request.name());
        brand.setLogoUrl(request.logoUrl());
        return brandRepository.save(brand);
    }

    public void deleteBrand(Long id) {
        if (!brandRepository.existsById(id))
            throw new ResourceNotFoundException("Brand not found");
        brandRepository.deleteById(id);
    }
}
