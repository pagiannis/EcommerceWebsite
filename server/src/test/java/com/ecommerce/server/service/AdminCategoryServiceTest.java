package com.ecommerce.server.service;

import com.ecommerce.server.exception.ConflictException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.CategoryRepository;
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
 * Unit tests για το AdminCategoryService — dependency check πριν τη
 * διαγραφή (bug #3). Ίδιο pattern με το AdminBrandServiceTest.
 */
@ExtendWith(MockitoExtension.class)
class AdminCategoryServiceTest {

    private static final Long CATEGORY_ID = 10L;

    @Mock private CategoryRepository categoryRepository;
    @Mock private ProductRepository productRepository;

    @InjectMocks
    private AdminCategoryService adminCategoryService;

    @Test
    @DisplayName("deleteCategory: άγνωστη → ResourceNotFoundException")
    void deleteCategory_notFound_throws() {
        when(categoryRepository.existsById(CATEGORY_ID)).thenReturn(false);

        assertThatThrownBy(() -> adminCategoryService.deleteCategory(CATEGORY_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Category not found");

        verify(categoryRepository, never()).deleteById(CATEGORY_ID);
    }

    @Test
    @DisplayName("deleteCategory: έχει associated products → ConflictException, δεν διαγράφει")
    void deleteCategory_hasProducts_throwsConflict() {
        when(categoryRepository.existsById(CATEGORY_ID)).thenReturn(true);
        when(productRepository.countByCategoryId(CATEGORY_ID)).thenReturn(7L);

        assertThatThrownBy(() -> adminCategoryService.deleteCategory(CATEGORY_ID))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("7 product(s)");

        verify(categoryRepository, never()).deleteById(CATEGORY_ID);
    }

    @Test
    @DisplayName("deleteCategory: χωρίς products → διαγράφεται κανονικά")
    void deleteCategory_noProducts_deletes() {
        when(categoryRepository.existsById(CATEGORY_ID)).thenReturn(true);
        when(productRepository.countByCategoryId(CATEGORY_ID)).thenReturn(0L);

        adminCategoryService.deleteCategory(CATEGORY_ID);

        verify(categoryRepository).deleteById(CATEGORY_ID);
    }
}
