package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.BrandRequest;
import com.ecommerce.server.models.Brand;
import com.ecommerce.server.exception.ConflictException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.BrandRepository;
import com.ecommerce.server.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminBrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Page<Brand> getAllBrands(Pageable pageable) {
        return brandRepository.findAll(pageable);
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

        // Άρνηση διαγραφής αν υπάρχουν products με αυτό το brand —
        // αλλιώς η βάση πετάει FK violation → γενικό 500. Προτιμάμε
        // καθαρό 409 Conflict με actionable μήνυμα για τον admin.
        long productCount = productRepository.countByBrandId(id);
        if (productCount > 0) {
            throw new ConflictException(
                    "Cannot delete brand: " + productCount + " product(s) still use it");
        }

        brandRepository.deleteById(id);
    }
}
