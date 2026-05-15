package com.ecommerce.server.controller;

import com.ecommerce.server.exception.BadRequestException;
import com.ecommerce.server.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests για το ProductController — εστιάζουν στο cross-field
 * validation (#8 Copilot): minPrice ≤ maxPrice. Το service δεν πρέπει
 * καν να κληθεί όταν το input είναι λογικά λάθος.
 */
@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock private ProductService productService;

    @InjectMocks
    private ProductController productController;

    @Test
    @DisplayName("getAllProducts: minPrice > maxPrice → BadRequestException, το service δεν καλείται")
    void getAllProducts_minGreaterThanMax_throws() {
        BigDecimal min = new BigDecimal("100");
        BigDecimal max = new BigDecimal("50");

        assertThatThrownBy(() -> productController.getAllProducts(
                null, 0, 9, min, max, null, null, null, null, null, null, null, null, null, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("minPrice must be less than or equal to maxPrice");

        verify(productService, never()).getFilteredProducts(
                any(), any(), any(), any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("getAllProducts: minPrice == maxPrice → OK (επιτρεπτό, σημαίνει 'ακριβώς αυτή τη τιμή')")
    void getAllProducts_minEqualsMax_passesThrough() {
        BigDecimal value = new BigDecimal("50");
        when(productService.getFilteredProducts(
                any(), any(), any(), any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        assertThatCode(() -> productController.getAllProducts(
                null, 0, 9, value, value, null, null, null, null, null, null, null, null, null, null))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("getAllProducts: μόνο minPrice ή μόνο maxPrice → no cross-field check, OK")
    void getAllProducts_onlyOneBoundary_passesThrough() {
        when(productService.getFilteredProducts(
                any(), any(), any(), any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        // Μόνο minPrice
        assertThatCode(() -> productController.getAllProducts(
                null, 0, 9, new BigDecimal("100"), null,
                null, null, null, null, null, null, null, null, null, null))
                .doesNotThrowAnyException();

        // Μόνο maxPrice
        assertThatCode(() -> productController.getAllProducts(
                null, 0, 9, null, new BigDecimal("50"),
                null, null, null, null, null, null, null, null, null, null))
                .doesNotThrowAnyException();
    }
}
