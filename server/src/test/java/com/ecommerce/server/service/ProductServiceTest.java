package com.ecommerce.server.service;

import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.dto.response.ProductSuggestionResponse;
import com.ecommerce.server.dto.response.ProductVariantResponse;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.models.Brand;
import com.ecommerce.server.models.Category;
import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.ProductType;
import com.ecommerce.server.models.enums.DressStyle;
import com.ecommerce.server.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        Category category = Category.builder().id(1L).name("Clothing").build();
        Brand brand = Brand.builder().id(1L).name("Nike").build();
        ProductType productType = ProductType.builder().id(1L).name("T-Shirt").build();

        testProduct = Product.builder()
                .id(100L)
                .name("Cool T-Shirt")
                .description("A very cool t-shirt")
                .category(category)
                .brand(brand)
                .productType(productType)
                .dressStyle(DressStyle.CASUAL)
                .price(BigDecimal.valueOf(29.99))
                .images(new ArrayList<>())
                .variants(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("getProductDetail: όταν βρεθεί, επιστρέφει ProductResponse")
    void getProductDetail_whenFound_returnsResponse() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(testProduct));

        ProductResponse response = productService.getProductDetail(100L);

        assertThat(response.id()).isEqualTo(100L);
        assertThat(response.name()).isEqualTo("Cool T-Shirt");
        assertThat(response.category()).isEqualTo("Clothing");
        assertThat(response.brand()).isEqualTo("Nike");
    }

    @Test
    @DisplayName("getProductDetail: όταν δεν βρεθεί, πετάει ResourceNotFoundException")
    void getProductDetail_whenNotFound_throws() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductDetail(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    @DisplayName("searchProducts: επιστρέφει Page από ProductResponse")
    void searchProducts_returnsPageOfResponses() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> productPage = new PageImpl<>(List.of(testProduct));
        
        when(productRepository.findByNameContainingIgnoreCase("cool", pageable))
                .thenReturn(productPage);

        Page<ProductResponse> result = productService.searchProducts("cool", pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).name()).isEqualTo("Cool T-Shirt");
    }

    @Test
    @DisplayName("autocomplete: επιστρέφει λίστα από ProductSuggestionResponse")
    void autocomplete_returnsSuggestions() {
        when(productRepository.findTop8ByWordPrefix(eq("coo"), any(Pageable.class)))
                .thenReturn(List.of(testProduct));

        List<ProductSuggestionResponse> suggestions = productService.autocomplete("coo");

        assertThat(suggestions).hasSize(1);
        assertThat(suggestions.get(0).id()).isEqualTo(100L);
        assertThat(suggestions.get(0).name()).isEqualTo("Cool T-Shirt");
        assertThat(suggestions.get(0).imageUrl()).isNull();
    }
}