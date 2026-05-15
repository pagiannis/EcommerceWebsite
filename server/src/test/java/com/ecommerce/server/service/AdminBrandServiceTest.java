package com.ecommerce.server.service;

import com.ecommerce.server.exception.ConflictException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.BrandRepository;
import com.ecommerce.server.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests για το AdminBrandService — εστιάζουν στο dependency check
 * πριν τη διαγραφή (bug #3). Πετάει 409 Conflict αντί να αφήνει τη βάση
 * να γυρίσει FK violation → 500.
 */
@ExtendWith(MockitoExtension.class)
class AdminBrandServiceTest {

    private static final Long BRAND_ID = 10L;

    @Mock private BrandRepository brandRepository;
    @Mock private ProductRepository productRepository;

    @InjectMocks
    private AdminBrandService adminBrandService;

    @Test
    @DisplayName("deleteBrand: brand δεν υπάρχει → ResourceNotFoundException")
    void deleteBrand_notFound_throws() {
        when(brandRepository.existsById(BRAND_ID)).thenReturn(false);

        assertThatThrownBy(() -> adminBrandService.deleteBrand(BRAND_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Brand not found");

        verify(brandRepository, never()).deleteById(BRAND_ID);
    }

    @Test
    @DisplayName("deleteBrand: brand χρησιμοποιείται από products → ConflictException, δεν διαγράφει")
    void deleteBrand_hasProducts_throwsConflict() {
        when(brandRepository.existsById(BRAND_ID)).thenReturn(true);
        when(productRepository.countByBrandId(BRAND_ID)).thenReturn(3L);

        assertThatThrownBy(() -> adminBrandService.deleteBrand(BRAND_ID))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("3 product(s)");

        verify(brandRepository, never()).deleteById(BRAND_ID);
    }

    @Test
    @DisplayName("deleteBrand: brand χωρίς προϊόντα → διαγράφεται κανονικά")
    void deleteBrand_noProducts_deletes() {
        when(brandRepository.existsById(BRAND_ID)).thenReturn(true);
        when(productRepository.countByBrandId(BRAND_ID)).thenReturn(0L);

        adminBrandService.deleteBrand(BRAND_ID);

        verify(brandRepository).deleteById(BRAND_ID);
    }
}
